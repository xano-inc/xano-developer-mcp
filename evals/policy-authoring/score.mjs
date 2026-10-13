#!/usr/bin/env node
// Scores a label's outputs against rubric.json.
//
//   node score.mjs --label <label> [--import <dir>] [--reparse]
//
// --import copies outputs from another layout first: <dir>/<GOAL>/{*.xs,reply.md,notes.json}
// (one repeat) or <dir>/<GOAL>/r<n>/... (several). Each .xs is parsed with
// `xano policy parse -o json` against the eval workspace; the result is cached in the run's
// parsed.json (--reparse refreshes it). Writes results/<label>/scores.json and summary.md.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { EVAL_DIR, RESULTS_DIR, loadEvalConfig, parseArgs, readJson, seedModel, writeJson, xano } from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.label) {
  console.error("--label is required");
  process.exit(1);
}
const cfg = loadEvalConfig();
const rubric = readJson(join(EVAL_DIR, "rubric.json"));
const goals = readJson(join(EVAL_DIR, "goals.json"));
const labelDir = join(RESULTS_DIR, args.label);
const runsDir = join(labelDir, "runs");

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const keepOutput = (name) => /\.(xs|md|json)$/.test(name) && !/\.parse\./.test(name);

if (args.import) {
  for (const goal of readdirSync(args.import).filter((g) => /^G\d+$/.test(g))) {
    const src = join(args.import, goal);
    const repeatDirs = readdirSync(src).filter((d) => /^r\d+$/.test(d) && isDir(join(src, d)));
    const pairs = repeatDirs.length ? repeatDirs.map((d) => [join(src, d), d]) : [[src, "r1"]];
    for (const [from, r] of pairs) {
      const dest = join(runsDir, goal, r);
      mkdirSync(dest, { recursive: true });
      for (const f of readdirSync(from)) if (keepOutput(f) && !isDir(join(from, f))) copyFileSync(join(from, f), join(dest, f));
      if (!existsSync(join(dest, "meta.json"))) writeJson(join(dest, "meta.json"), { goal_id: goal, repeat: Number(r.slice(1)), imported_from: from });
    }
  }
  if (!existsSync(join(labelDir, "run.json"))) writeJson(join(labelDir, "run.json"), { label: args.label, imported_from: args.import });
}

// ---------- parsing ----------

async function parsePolicy(file) {
  const r = await xano(["policy", "parse", "-o", "json", "-f", file]);
  let json = null;
  try {
    json = JSON.parse(r.stdout);
  } catch {}
  if (r.code !== 0 || !json?.policy) {
    const error = (r.stderr || r.stdout).replace(/\s*›\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
    return { file: basename(file), ok: false, error };
  }
  const p = json.policy;
  const warnings = [];
  for (const w of json.rule_warnings ?? []) for (const text of w.warnings ?? []) warnings.push({ rule_id: w.rule_id, text });
  return {
    file: basename(file),
    ok: true,
    key: p.key,
    title: p.title,
    statement: p.statement,
    enforcement: p.enforcement,
    active: p.active,
    severity: p.severity,
    rules: (p.rules ?? []).map((r) => ({ id: r.id, title: r.title, check: r.check, params: r.params })),
    warnings,
  };
}

async function parsedFor(runDir) {
  const cache = join(runDir, "parsed.json");
  const files = readdirSync(runDir).filter((f) => f.endsWith(".xs")).sort();
  if (!args.reparse && existsSync(cache)) {
    const c = readJson(cache);
    if (JSON.stringify(c.files) === JSON.stringify(files) && c.workspace_id === cfg.workspace_id) return c.policies;
  }
  const policies = [];
  for (const f of files) policies.push(await parsePolicy(join(runDir, f)));
  writeJson(cache, { workspace_id: cfg.workspace_id, files, policies });
  return policies;
}

// ---------- matching ----------

const UNKNOWN = /is not a XanoScript statement name|is not on this branch|is not in this workspace|^field_names .* is on no table/;
const UNTAGGED = /^(table_tags|tags|reaching_table_tags) .* is on no /;
const UNTAGGED_VALUE = /^(?:table_tags|tags|reaching_table_tags) "([^"]+)" is on no /;

const macros = rubric.macros ?? {};
const expand = (re) => re.replace(/\{\{(\w+)\}\}/g, (_, k) => macros[k] ?? "");
const rx = (re) => new RegExp(expand(re), "i");
const NEGATION = /(\bnot\b|n't\b|\bnever\b|\bno\b|\bnone\b|\bnothing\b|\bcannot\b|\bwithout\b|\bneither\b|\bnor\b|\bunable\b)/i;

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o && typeof o === "object" && !Array.isArray(o) ? o[k] : Array.isArray(o) && k in o ? o[k] : undefined), obj);
}
const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0) || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);
const asList = (v) => (Array.isArray(v) ? v : isEmpty(v) ? [] : [v]);

function constraintOk(value, c) {
  if (Array.isArray(c)) return c.every((x) => constraintOk(value, x));
  for (const [op, arg] of Object.entries(c)) {
    const list = asList(value).map(String);
    const ok = {
      eq: () => JSON.stringify(value) === JSON.stringify(arg),
      includes: () => arg.every((a) => list.includes(a)),
      includes_any: () => arg.some((a) => list.includes(a)),
      excludes_any: () => !arg.some((a) => list.includes(a)),
      nonempty: () => !isEmpty(value) === arg,
      empty: () => isEmpty(value) === arg,
      matches: () => typeof value === "string" && rx(arg).test(value),
      any_matches: () => list.some((v) => rx(arg).test(v)),
      gte: () => typeof value === "number" && value >= arg,
      lte: () => typeof value === "number" && value <= arg,
    }[op];
    if (!ok) throw new Error(`unknown constraint ${op}`);
    if (!ok()) return false;
  }
  return true;
}

// A rule "resolves" when its names and scope select something in the seeded workspace: no
// unknown-name warning, and every "tag is on no ..." warning names a tag that a tagging rule in
// the same run (table.tag_required tag, object.tag_required tag_set) puts in place.
function resolves(rule, ctx) {
  const produced = new Set(
    ctx.rules.flatMap((r) => (r.check === "table.tag_required" ? [r.params?.tag] : r.check === "object.tag_required" ? asList(r.params?.tag_set) : [])),
  );
  return ctx.warnings
    .filter((w) => w.rule_id === rule.id)
    .every((w) => {
      if (UNKNOWN.test(w.text)) return false;
      const m = w.text.match(UNTAGGED_VALUE);
      return !m || produced.has(m[1]);
    });
}

function ruleOk(rule, spec, ctx) {
  if (spec.resolves && !resolves(rule, ctx)) return false;
  const checks = asList(spec.check);
  if (checks.length && !checks.includes(rule.check)) return false;
  for (const [path, c] of Object.entries(spec.params ?? {})) if (!constraintOk(get(rule.params, path), c)) return false;
  if (spec.any_params && !Object.entries(spec.any_params).some(([path, c]) => constraintOk(get(rule.params, path), c))) return false;
  return true;
}

function sentences(text) {
  return text
    .replace(/[*_`#>]/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function replyOk(reply, spec) {
  const text = reply.replace(/[*_`]/g, "");
  if (spec.all && !spec.all.every((re) => rx(re).test(text))) return false;
  // One sentence, or one line (a bullet with its bold label), must match every regex.
  const units = [...sentences(reply), ...reply.replace(/[*_`#>]/g, "").split(/\n+/).map((l) => l.trim()).filter(Boolean)];
  if (spec.sentence_all && !units.some((s) => spec.sentence_all.every((re) => rx(re).test(s)))) return false;
  if (spec.none) {
    for (const re of spec.none) {
      const g = new RegExp(expand(re), "gi");
      for (const m of text.matchAll(g)) {
        const before = text.slice(Math.max(0, m.index - 40), m.index);
        if (!NEGATION.test(before)) return false;
      }
    }
  }
  return true;
}

// A table name used as a tag, where no rule in the run tags that table with it.
function tableNameAsTag(ctx) {
  const tableNames = new Set(Object.keys(seedModel().tables));
  const produced = new Set(ctx.rules.filter((r) => r.check === "table.tag_required").map((r) => r.params?.tag));
  const hits = [];
  for (const r of ctx.rules) {
    for (const p of ["table_tags", "reaching_table_tags", "table_selector.tag"]) {
      for (const v of asList(get(r.params, p))) if (tableNames.has(v) && !produced.has(v)) hits.push(`${r.id} ${p}: ${v}`);
    }
  }
  return hits;
}

// A consumer rule reading tag T (e.g. table_tags) where T is on one of the tables already, or a
// table.tag_required rule in the run puts T on one of them (by table name or by a field they have).
function tagChain(ctx, spec) {
  const seed = seedModel().tables;
  for (const r of ctx.rules) {
    if (r.check !== spec.check) continue;
    for (const tag of asList(get(r.params, spec.param))) {
      if (spec.tables_any.some((t) => seed[t]?.tags.includes(tag))) return true;
      for (const p of ctx.rules) {
        if (p.check !== "table.tag_required" || p.params?.tag !== tag) continue;
        const scoped = asList(p.params?.tables);
        const fields = asList(p.params?.field_names);
        if (scoped.length ? spec.tables_any.some((t) => scoped.includes(t)) : fields.some((f) => spec.tables_any.some((t) => seed[t]?.fields.includes(f)))) return true;
        if (p.params?.include_sensitive === true && !scoped.length) return true;
      }
    }
  }
  return false;
}

function matches(ctx, m) {
  if (m.all) return m.all.every((x) => matches(ctx, x));
  if (m.any) return m.any.some((x) => matches(ctx, x));
  if (m.not) return !matches(ctx, m.not);
  if (m.rule) return ctx.rules.some((r) => ruleOk(r, m.rule, ctx));
  if (m.tag_chain) return tagChain(ctx, m.tag_chain);
  if (m.no_policies) return ctx.policyFiles === 0;
  if (m.any_policy) return ctx.policies.some((p) => p.ok && Object.entries(m.any_policy).every(([k, v]) => p[k] === v));
  if (m.all_policies) return ctx.parsed.length > 0 && ctx.parsed.every((p) => Object.entries(m.all_policies).every(([k, v]) => p[k] === v));
  if (m.reply) return replyOk(ctx.reply, m.reply);
  if (m.warning) return ctx.warnings.some((w) => rx(m.warning).test(w.text));
  if (m.parse_failed) return ctx.policies.some((p) => !p.ok);
  if (m.policy_text) return ctx.parsed.some((p) => rx(m.policy_text).test(`${p.title ?? ""} ${p.statement ?? ""}`));
  if (m.detector === "table_name_as_tag") return tableNameAsTag(ctx).length > 0;
  throw new Error(`unknown matcher ${JSON.stringify(m)}`);
}

function evidence(ctx, m) {
  if (m.warning) return ctx.warnings.filter((w) => rx(m.warning).test(w.text)).map((w) => `${w.rule_id}: ${w.text}`);
  if (m.parse_failed) return ctx.policies.filter((p) => !p.ok).map((p) => `${p.file}: ${p.error}`);
  if (m.detector === "table_name_as_tag") return tableNameAsTag(ctx);
  if (m.rule) return ctx.rules.filter((r) => ruleOk(r, m.rule, ctx)).map((r) => r.id);
  return [];
}

function scoreGroup(ctx, g) {
  let best = null;
  for (const opt of g.any_of) {
    if (!matches(ctx, opt.match)) continue;
    const pts = opt.points ?? g.points;
    if (!best || pts > best.points) best = { points: pts, via: opt.desc ?? "matched", evidence: evidence(ctx, opt.match) };
  }
  return { id: g.id, max: g.points, points: best?.points ?? 0, via: best?.via ?? null, evidence: best?.evidence ?? [], desc: g.desc };
}

function scoreRun(goalId, ctx) {
  const gr = rubric.goals[goalId];
  const required = gr.required.map((g) => scoreGroup(ctx, g));
  const bonus = (gr.bonus ?? []).map((g) => scoreGroup(ctx, g));
  const forbidden = [...(gr.must_refuse && !rubric.global.applies_to_refusals ? [] : rubric.global.forbidden), ...(gr.forbidden ?? [])];
  const penalties = forbidden
    .filter((f) => matches(ctx, f.match))
    .map((f) => ({ id: f.id, penalty: f.penalty, desc: f.desc, evidence: evidence(ctx, f.match) }));
  const max = required.reduce((s, g) => s + g.max, 0);
  const earned = required.reduce((s, g) => s + g.points, 0);
  const bonusPts = bonus.reduce((s, g) => s + g.points, 0);
  const penalty = penalties.reduce((s, p) => s + p.penalty, 0);
  const points = Math.max(0, earned - penalty);
  return { points, max, pct: Math.round((100 * points) / max), earned, bonus_points: bonusPts, penalty, required, bonus, penalties };
}

// ---------- run over the label ----------


const results = [];
for (const goal of goals) {
  const gdir = join(runsDir, goal.id);
  if (!isDir(gdir)) continue;
  for (const r of readdirSync(gdir).filter((d) => /^r\d+$/.test(d)).sort()) {
    const runDir = join(gdir, r);
    const meta = existsSync(join(runDir, "meta.json")) ? readJson(join(runDir, "meta.json")) : {};
    const policies = await parsedFor(runDir);
    const parsed = policies.filter((p) => p.ok);
    const reply = existsSync(join(runDir, "reply.md")) ? readFileSync(join(runDir, "reply.md"), "utf8") : "";
    let notes = null;
    try {
      notes = readJson(join(runDir, "notes.json"));
    } catch {}
    const warnings = parsed.flatMap((p) => p.warnings);
    const ctx = { policies, parsed, policyFiles: policies.length, rules: parsed.flatMap((p) => p.rules), warnings, reply };
    const s = scoreRun(goal.id, ctx);
    results.push({
      goal_id: goal.id,
      repeat: Number(r.slice(1)),
      ...s,
      policy_files: policies.length,
      parse_ok: policies.filter((p) => p.ok).length,
      parse_errors: policies.filter((p) => !p.ok).map((p) => `${p.file}: ${p.error}`),
      rules: ctx.rules.map((x) => `${x.id} ${x.check}`),
      enforcement: [...new Set(parsed.map((p) => p.enforcement))],
      unknown_name_warnings: warnings.filter((w) => UNKNOWN.test(w.text)).map((w) => `${w.rule_id}: ${w.text}`),
      untagged_warnings: warnings.filter((w) => UNTAGGED.test(w.text)).map((w) => `${w.rule_id}: ${w.text}`),
      other_warnings: warnings.filter((w) => !UNKNOWN.test(w.text) && !UNTAGGED.test(w.text)).map((w) => `${w.rule_id}: ${w.text}`),
      refused: policies.length === 0,
      must_refuse: !!rubric.goals[goal.id].must_refuse,
      has_reply: reply.trim().length > 0,
      confidence: notes?.confidence_policy_achieves_goal ?? null,
      cost_usd: meta.cost_usd ?? null,
      wall_ms: meta.wall_ms ?? null,
      num_turns: meta.num_turns ?? null,
      timed_out: meta.timed_out ?? null,
      pulled_workspace: meta.pulled_workspace ?? null,
      forbidden_commands: meta.forbidden_commands ?? [],
      reads_outside_workdir: meta.reads_outside_workdir ?? [],
    });
  }
}
if (!results.length) {
  console.error(`No runs under ${runsDir}`);
  process.exit(1);
}

const runInfo = existsSync(join(labelDir, "run.json")) ? readJson(join(labelDir, "run.json")) : { label: args.label };
const totals = {
  runs: results.length,
  points: results.reduce((s, x) => s + x.points, 0),
  max: results.reduce((s, x) => s + x.max, 0),
  cost_usd: results.reduce((s, x) => s + (x.cost_usd ?? 0), 0),
  wall_ms_mean: Math.round(results.reduce((s, x) => s + (x.wall_ms ?? 0), 0) / results.length),
  policy_files: results.reduce((s, x) => s + x.policy_files, 0),
  parse_ok: results.reduce((s, x) => s + x.parse_ok, 0),
  unknown_name_warnings: results.reduce((s, x) => s + x.unknown_name_warnings.length, 0),
  bonus_points: results.reduce((s, x) => s + x.bonus_points, 0),
  penalty: results.reduce((s, x) => s + x.penalty, 0),
};
totals.pct = Math.round((100 * totals.points) / totals.max);
writeJson(join(labelDir, "scores.json"), { label: args.label, rubric_version: rubric.version, workspace_id: cfg.workspace_id, scored_at: new Date().toISOString(), run: runInfo, totals, results });

// ---------- summary.md ----------

const byGoal = new Map();
for (const x of results) byGoal.set(x.goal_id, [...(byGoal.get(x.goal_id) ?? []), x]);
const mean = (xs) => xs.reduce((s, v) => s + v, 0) / xs.length;
const fmt = (n, d = 1) => (n === null || Number.isNaN(n) ? "-" : Number(n).toFixed(d));
const lines = [];
lines.push(`# Policy-authoring eval: ${args.label}`, "");
lines.push(
  `Model ${runInfo.model ?? "?"}, effort ${runInfo.effort ?? "?"}, kit \`${runInfo.kit ?? runInfo.imported_from ?? "?"}\`, ${totals.runs} runs, rubric v${rubric.version}, scored against workspace ${cfg.workspace_id}.`,
  "",
);
lines.push(`**Total ${totals.points}/${totals.max} (${totals.pct}%)** (bonus +${totals.bonus_points} not counted, penalties -${totals.penalty}); policy files parse-clean ${totals.parse_ok}/${totals.policy_files}; unknown-name warnings ${totals.unknown_name_warnings}; cost $${fmt(totals.cost_usd, 2)}; mean wall time ${fmt(totals.wall_ms_mean / 1000, 0)} s per run.`, "");
lines.push("| Goal | Score (mean) | Per repeat | Bonus | Penalties | Policies (parse ok) | Unknown names | Refused | Confidence | Cost $ | Time s |");
lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
for (const [g, xs] of byGoal) {
  const refusal = xs.map((x) => (x.refused ? (x.must_refuse ? "yes (ok)" : "yes (wrong)") : x.must_refuse ? "no (wrong)" : "no")).join(", ");
  lines.push(
    `| ${g} | ${fmt(mean(xs.map((x) => x.points)))}/${xs[0].max} (${Math.round(mean(xs.map((x) => x.pct)))}%) | ${xs.map((x) => `${x.points}`).join(", ")} | ${xs.map((x) => `+${x.bonus_points}`).join(", ")} | ${xs.map((x) => (x.penalty ? `-${x.penalty}` : "0")).join(", ")} | ${xs.map((x) => `${x.policy_files} (${x.parse_ok})`).join(", ")} | ${xs.map((x) => x.unknown_name_warnings.length).join(", ")} | ${refusal} | ${xs.map((x) => x.confidence ?? "-").join(", ")} | ${xs.map((x) => fmt(x.cost_usd, 3)).join(", ")} | ${xs.map((x) => fmt(x.wall_ms === null ? null : x.wall_ms / 1000, 0)).join(", ")} |`,
  );
}
lines.push("", "## Per goal", "");
for (const [g, xs] of byGoal) {
  lines.push(`### ${g}: ${rubric.goals[g].summary}`, "");
  const ids = rubric.goals[g].required.map((x) => x.id);
  lines.push("| Check | Points | " + xs.map((x) => `r${x.repeat}`).join(" | ") + " |", "|---|---|" + xs.map(() => "---").join("|") + "|");
  for (const id of ids) {
    const cells = xs.map((x) => {
      const r = x.required.find((q) => q.id === id);
      return r.points === r.max ? `${r.points}` : r.points ? `${r.points} (${r.via})` : "0";
    });
    lines.push(`| ${id} | ${xs[0].required.find((q) => q.id === id).max} | ${cells.join(" | ")} |`);
  }
  for (const b of rubric.goals[g].bonus ?? []) {
    lines.push(`| bonus: ${b.id} | +${b.points} | ${xs.map((x) => (x.bonus.find((q) => q.id === b.id).points ? `+${x.bonus.find((q) => q.id === b.id).points}` : "-")).join(" | ")} |`);
  }
  const pens = [...new Set(xs.flatMap((x) => x.penalties.map((p) => p.id)))];
  for (const id of pens) {
    lines.push(`| penalty: ${id} | | ${xs.map((x) => { const p = x.penalties.find((q) => q.id === id); return p ? `-${p.penalty}` : "-"; }).join(" | ")} |`);
  }
  lines.push("");
  for (const x of xs) {
    const notes = [];
    if (x.rules.length) notes.push(`rules: ${x.rules.join("; ")}`);
    for (const p of x.penalties) notes.push(`penalty ${p.id}: ${p.evidence.slice(0, 3).join(" / ") || p.desc}`);
    if (x.parse_errors.length) notes.push(`parse errors: ${x.parse_errors.join(" / ")}`);
    if (x.untagged_warnings.length) notes.push(`untagged: ${x.untagged_warnings.join(" / ")}`);
    if (x.forbidden_commands.length) notes.push(`FORBIDDEN COMMANDS: ${x.forbidden_commands.join(" / ")}`);
    if (x.reads_outside_workdir.length) notes.push(`reads outside workdir: ${x.reads_outside_workdir.slice(0, 5).join(" / ")}`);
    if (x.timed_out) notes.push("timed out");
    if (x.pulled_workspace === false) notes.push("did not pull the workspace");
    lines.push(`- r${x.repeat}: ${notes.join(". ") || "no policies"}`);
  }
  lines.push("");
}
writeFileSync(join(labelDir, "summary.md"), lines.join("\n") + "\n");
console.log(lines.slice(0, 8 + byGoal.size).join("\n"));
console.log(`\nWrote ${join(labelDir, "scores.json")} and summary.md`);

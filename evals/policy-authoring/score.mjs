#!/usr/bin/env node
// Scores a label's outputs against rubric.json.
//
//   node score.mjs --label <label> [--import <dir>] [--reparse] [--revalidate]
//
// Per run: the build (build/, build.json, written by run.mjs) is applied to a scratch copy of
// seed/ and validated with `xano workspace push --dry-run` against the eval workspace and the
// XanoScript language server (cached in build_check.json; --revalidate refreshes it). Each policy
// file (build/policies/*.xs, and *.xs at the run's root for older layouts) is parsed with
// `xano policy parse -o json` (cached in parsed.json; --reparse refreshes it); a warning about a
// name the build adds (a function, middleware, table, tag or field) is resolved by the build.
// The rubric then scores enforcement (the objects built and wired in), coverage (rules naming
// them), the plan and honesty. Writes results/<label>/scores.json and summary.md.
//
// --import copies outputs from another layout first: <dir>/<GOAL>/{*.xs,reply.md,notes.json}
// (one repeat) or <dir>/<GOAL>/r<n>/... (several).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { checkBuild } from "./lib/build.mjs";
import { EVAL_DIR, RESULTS_DIR, loadEvalConfig, parseArgs, readJson, seedModel, writeJson, xano } from "./lib/common.mjs";
import { mentionPatterns, middlewareFor, reach } from "./lib/xs.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.label) {
  console.error("--label is required");
  process.exit(1);
}
const cfg = loadEvalConfig();
// `{"$spec": name, ...overrides}` anywhere in the rubric stands for rubric.specs[name] (an object spec).
function resolveSpecs(v, specs) {
  if (Array.isArray(v)) return v.map((x) => resolveSpecs(x, specs));
  if (!v || typeof v !== "object") return v;
  if (v.$spec) {
    const { $spec, ...rest } = v;
    if (!specs[$spec]) throw new Error(`unknown spec ${$spec}`);
    return { ...resolveSpecs(specs[$spec], specs), ...resolveSpecs(rest, specs) };
  }
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveSpecs(x, specs)]));
}
const rubricRaw = readJson(join(EVAL_DIR, "rubric.json"));
const rubric = resolveSpecs(rubricRaw, rubricRaw.specs ?? {});
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

async function parsePolicy(file, rel) {
  const r = await xano(["policy", "parse", "-o", "json", "-f", file]);
  let json = null;
  try {
    json = JSON.parse(r.stdout);
  } catch {}
  if (r.code !== 0 || !json?.policy) {
    const error = (r.stderr || r.stdout).replace(/\s*›\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
    return { file: rel, ok: false, error };
  }
  const p = json.policy;
  const warnings = [];
  for (const w of json.rule_warnings ?? []) for (const text of w.warnings ?? []) warnings.push({ rule_id: w.rule_id, text });
  return {
    file: rel,
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

// Policy files: the build's policies/ and, for older layouts or a stray policy, the run's root.
function policyFiles(runDir) {
  const root = readdirSync(runDir).filter((f) => f.endsWith(".xs")).sort();
  const pdir = join(runDir, "build", "policies");
  const built = isDir(pdir) ? readdirSync(pdir).filter((f) => f.endsWith(".xs")).sort().map((f) => `build/policies/${f}`) : [];
  return [...built, ...root];
}

async function parsedFor(runDir) {
  const cache = join(runDir, "parsed.json");
  const files = policyFiles(runDir);
  if (!args.reparse && existsSync(cache)) {
    const c = readJson(cache);
    if (JSON.stringify(c.files) === JSON.stringify(files) && c.workspace_id === cfg.workspace_id) return c.policies;
  }
  const policies = [];
  for (const f of files) policies.push(await parsePolicy(join(runDir, f), f));
  writeJson(cache, { workspace_id: cfg.workspace_id, files, policies });
  return policies;
}

// ---------- the build's names ----------

const KIND_WORDS = { function: "function", middleware: "middleware", task: "task", tool: "tool", table: "table", "api group": "api_group", trigger: "trigger", agent: "agent", addon: "addon", query: "query", endpoint: "query", "mcp server": "mcp_server" };

// A parse warning that a name is missing (parsed against the workspace as it is), which the build
// adds: the function, middleware or table is built, the tag is on a built or changed object.
function resolvedByBuild(text, model) {
  if (!model) return false;
  let m;
  if ((m = text.match(/^(.+?) "([^"]+)"(?:, which field names,)? is not (?:on this branch|in this workspace)/))) {
    const kind = KIND_WORDS[m[1].toLowerCase()];
    return !!kind && model.objects.some((o) => o.kind === kind && o.name === m[2]);
  }
  if ((m = text.match(/^field_names "([^"]+)" is on no table/))) return model.objects.some((o) => o.kind === "table" && o.fields.some((f) => f.name === m[1]));
  if ((m = text.match(/^[\w.]+ "([^"]+)" is on no (.+?)(?: on this branch| in this workspace)?, so/))) {
    const what = m[2];
    const any = /object/.test(what);
    const kinds = Object.entries(KIND_WORDS).filter(([w]) => new RegExp(`\\b${w}\\b`).test(what)).map(([, k]) => k);
    if (kinds.includes("query")) kinds.push("api_group");
    return model.objects.some((o) => (any || kinds.includes(o.kind)) && o.tags.includes(m[1]));
  }
  return false;
}

// ---------- matching ----------

const UNKNOWN = /is not a XanoScript statement name|is not on this branch|is not in this workspace|^field_names .* is on no table/;
const UNTAGGED = /^(table_tags|tags|reaching_table_tags) .* is on no /;
const UNTAGGED_VALUE = /^(?:table_tags|tags|reaching_table_tags) "([^"]+)" is on no /;

const macros = rubric.macros ?? {};
const expand = (re) => re.replace(/\{\{(\w+)\}\}/g, (_, k) => macros[k] ?? "");
const rx = (re, flags = "i") => new RegExp(expand(re), flags);
const NEGATION = /(\bnot\b|n't\b|\bnever\b|\bno\b|\bnone\b|\bnothing\b|\bcannot\b|\bwithout\b|\bneither\b|\bnor\b|\bunable\b)/i;

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o && typeof o === "object" && !Array.isArray(o) ? o[k] : Array.isArray(o) && k in o ? o[k] : undefined), obj);
}
const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0) || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);
const asList = (v) => (Array.isArray(v) ? v : isEmpty(v) ? [] : [v]);

function constraintOk(value, c, ctx) {
  if (Array.isArray(c)) return c.every((x) => constraintOk(value, x, ctx));
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
      // The value names an object of the post-build workspace that meets an object spec.
      names_object: () => {
        const names = new Set(objectsMatching(ctx, arg).map((o) => o.name));
        return list.some((v) => names.has(v));
      },
      // The value lists a tag that an object meeting the spec carries.
      tags_object: () => {
        const tags = new Set(objectsMatching(ctx, arg).flatMap((o) => o.tags));
        return list.some((v) => tags.has(v));
      },
    }[op];
    if (!ok) throw new Error(`unknown constraint ${op}`);
    if (!ok()) return false;
  }
  return true;
}

// A rule "resolves" when its names and scope select something in the post-build workspace: no
// unknown-name warning the build leaves standing, and every "tag is on no ..." warning names a
// tag the build puts in place or a tagging rule in the same run (table.tag_required tag,
// object.tag_required tag_set) requires.
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
  for (const [path, c] of Object.entries(spec.params ?? {})) if (!constraintOk(get(rule.params, path), c, ctx)) return false;
  if (spec.any_params && !Object.entries(spec.any_params).some(([path, c]) => constraintOk(get(rule.params, path), c, ctx))) return false;
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
  const tagged = new Set((ctx.model?.objects ?? []).filter((o) => o.kind === "table").flatMap((o) => o.tags));
  const hits = [];
  for (const r of ctx.rules) {
    for (const p of ["table_tags", "reaching_table_tags", "table_selector.tag"]) {
      for (const v of asList(get(r.params, p))) if (tableNames.has(v) && !produced.has(v) && !tagged.has(v)) hits.push(`${r.id} ${p}: ${v}`);
    }
  }
  return hits;
}

// A consumer rule reading tag T (e.g. table_tags) where T is on one of the tables (in the seed or
// after the build), or a table.tag_required rule in the run puts T on one of them.
function tagChain(ctx, spec) {
  const seed = seedModel().tables;
  const tagsOf = (t) => new Set([...(seed[t]?.tags ?? []), ...(ctx.model?.byKey.get(`table:${t}`)?.tags ?? [])]);
  for (const r of ctx.rules) {
    if (r.check !== spec.check) continue;
    for (const tag of asList(get(r.params, spec.param))) {
      if (spec.tables_any.some((t) => tagsOf(t).has(tag))) return true;
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

// ----- build matchers -----

// Where an object comes from: built in this run (new), an existing object the run changed
// (changed), or untouched (existing).
function origin(ctx, o) {
  if (ctx.build?.added?.includes(o.file)) return "new";
  if (ctx.build?.modified?.includes(o.file)) return "changed";
  return "existing";
}

function stmtOk(ctx, s, spec) {
  if (spec.statement && !new RegExp(`^(${spec.statement})$`).test(s.name)) return false;
  if (spec.target !== undefined) {
    const t = spec.target;
    if (typeof t === "string" && !(s.target && new RegExp(`^(${t})$`, "i").test(s.target))) return false;
    if (t?.new_table && !(s.target && ctx.model.objects.some((o) => o.kind === "table" && o.name === s.target && origin(ctx, o) === "new"))) return false;
    if (t?.tables && !t.tables.includes(s.target)) return false;
  }
  if (spec.text && !rx(spec.text, "im").test(s.text)) return false;
  return true;
}

// Text of every call to a function: `function.run <name> {...}` blocks anywhere in the build.
function callSites(ctx, name) {
  return ctx.model.objects.flatMap((o) => o.statements.filter((s) => s.name === "function.run" && s.target === name).map((s) => s.text));
}

// Objects of the post-build workspace that meet an object spec (see README, Rubric).
function objectsMatching(ctx, spec) {
  if (!ctx.model) return [];
  const key = JSON.stringify(spec);
  if (ctx.memo.has(key)) return ctx.memo.get(key);
  const kinds = asList(spec.kind);
  const out = ctx.model.objects.filter((o) => {
    if (kinds.length && !kinds.includes(o.kind)) return false;
    const org = origin(ctx, o);
    if (spec.origin && spec.origin !== "any" && !asList(spec.origin).includes(org)) return false;
    if (spec.name && !rx(spec.name).test(o.name)) return false;
    const r = reach(ctx.model, o);
    if (spec.reach_all && !spec.reach_all.every((x) => r.some((s) => stmtOk(ctx, s, x)))) return false;
    if (spec.reach_any && !spec.reach_any.some((x) => r.some((s) => stmtOk(ctx, s, x)))) return false;
    if (spec.reach_distinct) {
      const d = spec.reach_distinct;
      const targets = new Set(r.filter((s) => stmtOk(ctx, s, { statement: d.statement, target: d.target })).map((s) => s.target));
      if (targets.size < d.min) return false;
    }
    // The object's own source, the functions it reaches, and the calls made to it.
    const texts = [o.text, ...r.filter((s) => s.owner !== o.name).map((s) => s.text), ...(o.kind === "function" ? callSites(ctx, o.name) : [])].join("\n");
    if (spec.source_all && !spec.source_all.every((re) => rx(re, "im").test(texts))) return false;
    if (spec.source_any && !spec.source_any.some((re) => rx(re, "im").test(texts))) return false;
    if (spec.auth_aware && !/\$auth\b/.test(texts)) return false;
    if (spec.runs && o.kind === "task" && !(o.active && o.schedule)) return false;
    return true;
  });
  ctx.memo.set(key, out);
  return out;
}

// Targets for wiring: existing objects (they are in the seed) selected by key, kind, API group,
// or the tables they reach (optionally only by writing).
const WRITES = /^db\.(add|edit|patch|del|add_or_edit|bulk\.\w+|truncate)$/;
function targetsOf(ctx, spec) {
  const seedKeys = new Set(ctx.seed.objects.map((o) => `${o.kind}:${o.name}`));
  return ctx.model.objects.filter((o) => {
    if (!seedKeys.has(`${o.kind}:${o.name}`)) return false;
    if (spec.keys) return spec.keys.includes(`${o.kind}:${o.name}`);
    if (spec.kind && !asList(spec.kind).includes(o.kind)) return false;
    if (spec.api_group && o.api_group !== spec.api_group) return false;
    if (spec.public && o.auth) return false;
    if (spec.reaches_tables) {
      // Judged on the seed's own version, so removing the reach does not drop a target.
      const so = ctx.seed.byKey.get(`${o.kind}:${o.name}`);
      const r = reach(ctx.seed, so);
      if (!r.some((s) => spec.reaches_tables.includes(s.target) && /^db\./.test(s.name) && (!spec.writes || WRITES.test(s.name)))) return false;
    }
    return true;
  });
}

// Is a target wired to an enforcement object, one of the listed ways?
function wiredBy(ctx, t, ways, viaFns, viaMws) {
  for (const way of ways) {
    if (way === "call" && reach(ctx.model, t).some((s) => s.name === "function.run" && viaFns.has(s.target))) return way;
    if (way === "call_first") {
      const first = t.statements.find((s) => s.depth === 0 && !s.disabled);
      if (first?.name === "function.run" && viaFns.has(first.target)) return way;
    }
    if (way.startsWith("call_before:")) {
      const guard = new RegExp(`^(${way.slice(12)})$`);
      const flat = reach(ctx.model, t);
      const call = flat.findIndex((s) => s.name === "function.run" && viaFns.has(s.target));
      const guarded = flat.findIndex((s) => guard.test(s.name));
      if (call >= 0 && guarded >= 0 && call < guarded) return way;
    }
    if (way === "pre_middleware" && middlewareFor(ctx.model, t, "pre").some((n) => viaMws.has(n))) return way;
    if (way === "middleware" && ["pre", "post"].some((p) => middlewareFor(ctx.model, t, p).some((n) => viaMws.has(n)))) return way;
  }
  return null;
}

function wired(ctx, spec) {
  const via = objectsMatching(ctx, spec.via);
  const viaFns = new Set(via.filter((o) => o.kind === "function").map((o) => o.name));
  const viaMws = new Set(via.filter((o) => o.kind === "middleware").map((o) => o.name));
  const targets = targetsOf(ctx, spec.targets);
  const done = [];
  const missing = [];
  for (const t of targets) (wiredBy(ctx, t, spec.how, viaFns, viaMws) ? done : missing).push(t.name);
  const frac = targets.length ? done.length / targets.length : 0;
  const ok = done.length >= (spec.min_count ?? 1) && frac >= (spec.min_fraction ?? 1);
  const name = [...viaFns, ...viaMws].join(", ") || "none";
  return { ok, evidence: [`via ${name}: ${done.length}/${targets.length}${missing.length ? `; not wired: ${missing.join(", ")}` : ""}`] };
}

function tablesTagged(ctx, spec) {
  const tables = spec.tables.map((t) => ctx.model?.byKey.get(`table:${t}`)).filter(Boolean);
  const counts = new Map();
  for (const t of tables) for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const [tag, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  const ok = n >= Math.ceil((spec.min_fraction ?? 1) * spec.tables.length);
  return { ok, evidence: [tag ? `tag "${tag}" on ${n}/${spec.tables.length}` : "no tag on these tables"] };
}

function fieldsAttr(ctx, spec) {
  const hits = [];
  const misses = [];
  for (const tf of spec.fields) {
    const [t, f] = tf.split(".");
    const field = ctx.model?.byKey.get(`table:${t}`)?.fields.find((x) => x.name === f);
    (field && field.attrs[spec.attr] === (spec.value ?? true) ? hits : misses).push(tf);
  }
  const ok = hits.length >= Math.ceil((spec.min_fraction ?? 1) * spec.fields.length);
  return { ok, evidence: [`${spec.attr}: ${hits.length}/${spec.fields.length}${misses.length ? `; missing ${misses.join(", ")}` : ""}`] };
}

function sourceCheck(ctx, spec) {
  const o = ctx.model?.byKey.get(spec.key);
  if (!o) return { ok: !!spec.absent_ok, evidence: [`${spec.key} not in the build`] };
  if (spec.changed && origin(ctx, o) !== "changed") return { ok: false, evidence: [`${spec.key} unchanged`] };
  const bad = (spec.none ?? []).filter((re) => rx(re, "im").test(o.text));
  const missing = (spec.all ?? []).filter((re) => !rx(re, "im").test(o.text));
  return { ok: !bad.length && !missing.length, evidence: [...bad.map((b) => `still matches ${b}`), ...missing.map((m) => `lacks ${m}`)] };
}

// Objects the build added or changed (policy files aside), and whether the reply names each.
function builtObjects(ctx) {
  if (!ctx.model) return [];
  return ctx.model.objects.filter((o) => origin(ctx, o) !== "existing");
}
function named(ctx, o) {
  return mentionPatterns(o).some((p) => p.test(ctx.reply));
}
function firstMention(text, patterns) {
  let at = -1;
  for (const p of patterns) {
    const m = text.match(p);
    if (m && (at < 0 || m.index < at)) at = m.index;
  }
  return at;
}

function plan(ctx, spec) {
  const built = builtObjects(ctx);
  if (spec.check === "first") return { ok: !!ctx.meta.plan_first, evidence: [ctx.meta.plan_first === undefined ? "no transcript facts" : ctx.meta.plan_first ? "reply.md written before any project file" : `reply.md first written at step ${ctx.meta.first_reply_write ?? "never"}, first project write at step ${ctx.meta.first_build_write ?? "never"}`] };
  if (spec.check === "names_build") {
    const unnamed = built.filter((o) => !named(ctx, o)).map((o) => o.name);
    const frac = built.length ? (built.length - unnamed.length) / built.length : 0;
    return { ok: built.length > 0 && frac >= (spec.min_fraction ?? 1), evidence: [built.length ? `${built.length - unnamed.length}/${built.length} named${unnamed.length ? `; not named: ${unnamed.join(", ")}` : ""}` : "nothing built"] };
  }
  if (spec.check === "build_before_policy") {
    const created = built.filter((o) => origin(ctx, o) === "new");
    const objAt = firstMention(ctx.reply, created.flatMap(mentionPatterns));
    const keys = ctx.parsed.map((p) => p.key).filter(Boolean);
    const polAt = firstMention(ctx.reply, keys.map((k) => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")));
    const ok = objAt >= 0 && (polAt < 0 || objAt < polAt);
    return { ok, evidence: [`first built object at ${objAt}, first policy key at ${polAt}`] };
  }
  throw new Error(`unknown plan check ${spec.check}`);
}

function buildState(ctx, spec) {
  const b = ctx.build;
  if (!b?.present || !(b.object_files.length + b.policy_files.length)) return { ok: false, evidence: ["no build"] };
  if (spec.check === "validates") {
    const blocked = b.dry_run.blocked.length || b.dry_run.error;
    const unresolved = b.dry_run.unresolved.length;
    const syntax = b.language_server.errors.length + b.unreadable.length;
    const level = spec.level ?? "clean";
    const ok = !blocked && !unresolved && (level === "not_blocked" || !syntax);
    const ev = [
      b.dry_run.error ? `dry run failed: ${b.dry_run.error}` : `dry run ${b.dry_run.status}`,
      ...b.dry_run.blocked.map((x) => `blocked ${x}`),
      ...b.dry_run.unresolved.map((x) => `unresolved ${x}`),
      ...b.language_server.errors.map((x) => `syntax ${x}`),
      ...b.unreadable.map((x) => `unreadable ${x}`),
    ];
    return { ok, evidence: ev };
  }
  if (spec.check === "objects") return { ok: b.object_files.length > 0, evidence: b.object_files };
  throw new Error(`unknown build check ${spec.check}`);
}

function edits(ctx, spec) {
  const changed = (ctx.build?.modified ?? []).filter((r) => !r.startsWith("policies/"));
  if (spec.unrelated) {
    const off = changed.filter((r) => !spec.unrelated.some((re) => new RegExp(re).test(r)));
    return { ok: off.length > 0, evidence: off };
  }
  if (spec.deleted) return { ok: (ctx.build?.deleted ?? []).length > 0, evidence: ctx.build?.deleted ?? [] };
  if (spec.unplanned) {
    const off = builtObjects(ctx).filter((o) => !named(ctx, o)).map((o) => `${o.kind} ${o.name}`);
    return { ok: off.length > 0, evidence: off };
  }
  throw new Error("unknown edits matcher");
}

function evaluate(ctx, m) {
  if (m.all) return { ok: m.all.every((x) => evaluate(ctx, x).ok), evidence: m.all.flatMap((x) => evaluate(ctx, x).evidence) };
  if (m.any) {
    const hit = m.any.map((x) => evaluate(ctx, x)).find((r) => r.ok);
    return hit ?? { ok: false, evidence: [] };
  }
  if (m.not) return { ok: !evaluate(ctx, m.not).ok, evidence: [] };
  if (m.rule) {
    const hits = ctx.rules.filter((r) => ruleOk(r, m.rule, ctx)).map((r) => r.id);
    return { ok: hits.length > 0, evidence: hits };
  }
  if (m.object) {
    const hits = objectsMatching(ctx, m.object);
    return { ok: hits.length > 0, evidence: hits.map((o) => `${o.kind} ${o.name} (${origin(ctx, o)})`) };
  }
  if (m.wired) return ctx.model ? wired(ctx, m.wired) : { ok: false, evidence: ["no build"] };
  if (m.tables_tagged) return tablesTagged(ctx, m.tables_tagged);
  if (m.fields_attr) return fieldsAttr(ctx, m.fields_attr);
  if (m.source) return sourceCheck(ctx, m.source);
  if (m.plan) return plan(ctx, m.plan);
  if (m.build) return buildState(ctx, m.build);
  if (m.edits) return edits(ctx, m.edits);
  if (m.push_violation) return { ok: (ctx.meta.push_violations ?? []).length > 0, evidence: ctx.meta.push_violations ?? [] };
  if (m.tag_chain) return { ok: tagChain(ctx, m.tag_chain), evidence: [] };
  if (m.no_policies) return { ok: ctx.policyFiles === 0, evidence: [] };
  if (m.any_policy) return { ok: ctx.policies.some((p) => p.ok && Object.entries(m.any_policy).every(([k, v]) => p[k] === v)), evidence: [] };
  if (m.all_policies) return { ok: ctx.parsed.length > 0 && ctx.parsed.every((p) => Object.entries(m.all_policies).every(([k, v]) => p[k] === v)), evidence: [] };
  if (m.reply) return { ok: replyOk(ctx.reply, m.reply), evidence: [] };
  if (m.warning) {
    const hits = ctx.warnings.filter((w) => rx(m.warning).test(w.text)).map((w) => `${w.rule_id}: ${w.text}`);
    return { ok: hits.length > 0, evidence: hits };
  }
  if (m.parse_failed) {
    const hits = ctx.policies.filter((p) => !p.ok).map((p) => `${p.file}: ${p.error}`);
    return { ok: hits.length > 0, evidence: hits };
  }
  if (m.policy_text) return { ok: ctx.parsed.some((p) => rx(m.policy_text).test(`${p.title ?? ""} ${p.statement ?? ""}`)), evidence: [] };
  if (m.detector === "table_name_as_tag") {
    const hits = tableNameAsTag(ctx);
    return { ok: hits.length > 0, evidence: hits };
  }
  throw new Error(`unknown matcher ${JSON.stringify(m)}`);
}

function scoreGroup(ctx, g) {
  let best = null;
  const misses = [];
  for (const opt of g.any_of) {
    const r = evaluate(ctx, opt.match);
    const pts = opt.points ?? g.points;
    if (!r.ok) {
      const seen = r.evidence.slice(0, 3).join("; ");
      if (seen && !misses.some((m) => m.endsWith(`: ${seen}`))) misses.push(`${opt.desc ?? "option"}: ${seen}`);
      continue;
    }
    if (!best || pts > best.points) best = { points: pts, via: opt.desc ?? "matched", evidence: r.evidence };
  }
  const res = { id: g.id, kind: g.kind ?? null, max: g.points, points: best?.points ?? 0, via: best?.via ?? null, evidence: best?.evidence ?? [], desc: g.desc };
  // Why it fell short: what the nearest options saw.
  if (res.points < res.max) res.reason = misses.slice(0, 3).join(" | ") || "no matching rule, object or reply text";
  return res;
}

function scoreRun(goalId, ctx) {
  const gr = rubric.goals[goalId];
  const g = rubric.global;
  const groups = [...(gr.must_refuse ? [] : g.required ?? []), ...(gr.build ? g.build_required ?? [] : []), ...gr.required];
  const required = groups.map((x) => scoreGroup(ctx, x));
  const bonus = (gr.bonus ?? []).map((x) => scoreGroup(ctx, x));
  const forbidden = [...(gr.must_refuse && !g.applies_to_refusals ? [] : g.forbidden), ...(g.forbidden_all ?? []), ...(gr.forbidden ?? [])];
  const penalties = forbidden
    .map((f) => ({ f, r: evaluate(ctx, f.match) }))
    .filter(({ r }) => r.ok)
    .map(({ f, r }) => ({ id: f.id, penalty: f.penalty, desc: f.desc, evidence: r.evidence }));
  const max = required.reduce((s, x) => s + x.max, 0);
  const earned = required.reduce((s, x) => s + x.points, 0);
  const bonusPts = bonus.reduce((s, x) => s + x.points, 0);
  const penalty = penalties.reduce((s, p) => s + p.penalty, 0);
  const points = Math.max(0, earned - penalty);
  // Points by aspect: enforcement, coverage, plan, honesty (groups carry a kind).
  const byKind = {};
  for (const x of required) {
    const k = x.kind ?? "coverage";
    byKind[k] ??= { points: 0, max: 0 };
    byKind[k].points += x.points;
    byKind[k].max += x.max;
  }
  return { points, max, pct: Math.round((100 * points) / max), earned, bonus_points: bonusPts, penalty, by_kind: byKind, required, bonus, penalties };
}

// ---------- run over the label ----------

const results = [];
for (const goal of goals) {
  const gdir = join(runsDir, goal.id);
  if (!isDir(gdir) || !rubric.goals[goal.id]) continue;
  for (const r of readdirSync(gdir).filter((d) => /^r\d+$/.test(d)).sort()) {
    const runDir = join(gdir, r);
    const meta = existsSync(join(runDir, "meta.json")) ? readJson(join(runDir, "meta.json")) : {};
    const build = await checkBuild(runDir, { workspaceId: cfg.workspace_id, revalidate: !!args.revalidate });
    const policies = await parsedFor(runDir);
    const parsed = policies.filter((p) => p.ok);
    const reply = existsSync(join(runDir, "reply.md")) ? readFileSync(join(runDir, "reply.md"), "utf8") : "";
    let notes = null;
    try {
      notes = readJson(join(runDir, "notes.json"));
    } catch {}
    const model = build.present ? build.model : null;
    const raw = parsed.flatMap((p) => p.warnings);
    const resolvedByBuildList = raw.filter((w) => resolvedByBuild(w.text, model));
    const warnings = raw.filter((w) => !resolvedByBuildList.includes(w));
    const ctx = {
      policies,
      parsed,
      policyFiles: policies.length,
      rules: parsed.flatMap((p) => p.rules),
      warnings,
      reply,
      meta,
      build: build.present ? build : null,
      model,
      seed: build.present ? build.seed : null,
      memo: new Map(),
    };
    const s = scoreRun(goal.id, ctx);
    const built = builtObjects(ctx);
    results.push({
      goal_id: goal.id,
      repeat: Number(r.slice(1)),
      ...s,
      policy_files: policies.length,
      policies_outside_build: policies.filter((p) => !p.file.startsWith("build/")).map((p) => p.file),
      parse_ok: policies.filter((p) => p.ok).length,
      parse_errors: policies.filter((p) => !p.ok).map((p) => `${p.file}: ${p.error}`),
      rules: ctx.rules.map((x) => `${x.id} ${x.check}`),
      enforcement: [...new Set(parsed.map((p) => p.enforcement))],
      build: build.present
        ? {
            added: build.added.filter((f) => !f.startsWith("policies/")),
            modified: build.modified.filter((f) => !f.startsWith("policies/")),
            deleted: build.deleted,
            objects: built.map((o) => `${origin(ctx, o) === "new" ? "+" : "~"}${o.kind} ${o.name}`),
            dry_run: build.dry_run.error ? "failed" : build.dry_run.ran ? build.dry_run.status : "not run",
            blocked: build.dry_run.blocked,
            unresolved: build.dry_run.unresolved,
            syntax_errors: [...build.language_server.errors, ...build.unreadable.map((u) => `${u}: unreadable`)],
          }
        : null,
      resolved_by_build: resolvedByBuildList.map((w) => `${w.rule_id}: ${w.text}`),
      unknown_name_warnings: warnings.filter((w) => UNKNOWN.test(w.text)).map((w) => `${w.rule_id}: ${w.text}`),
      untagged_warnings: warnings.filter((w) => UNTAGGED.test(w.text)).map((w) => `${w.rule_id}: ${w.text}`),
      other_warnings: warnings.filter((w) => !UNKNOWN.test(w.text) && !UNTAGGED.test(w.text)).map((w) => `${w.rule_id}: ${w.text}`),
      refused: policies.length === 0,
      must_refuse: !!rubric.goals[goal.id].must_refuse,
      has_reply: reply.trim().length > 0,
      plan_first: meta.plan_first ?? null,
      confidence: notes?.confidence_policy_achieves_goal ?? null,
      cost_usd: meta.cost_usd ?? null,
      wall_ms: meta.wall_ms ?? null,
      num_turns: meta.num_turns ?? null,
      timed_out: meta.timed_out ?? null,
      pulled_workspace: meta.pulled_workspace ?? null,
      dry_run_calls: meta.dry_run_calls ?? null,
      push_violations: meta.push_violations ?? [],
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
const sum = (f) => results.reduce((s, x) => s + (f(x) ?? 0), 0);
const totals = {
  runs: results.length,
  points: sum((x) => x.points),
  max: sum((x) => x.max),
  cost_usd: sum((x) => x.cost_usd),
  wall_ms_mean: Math.round(sum((x) => x.wall_ms) / results.length),
  policy_files: sum((x) => x.policy_files),
  parse_ok: sum((x) => x.parse_ok),
  unknown_name_warnings: sum((x) => x.unknown_name_warnings.length),
  bonus_points: sum((x) => x.bonus_points),
  penalty: sum((x) => x.penalty),
  builds_valid: results.filter((x) => x.required.find((q) => q.id === "build_validates")?.points === x.required.find((q) => q.id === "build_validates")?.max && x.build).length,
  plan_first: results.filter((x) => x.plan_first).length,
  push_violations: sum((x) => x.push_violations.length),
  by_kind: {},
};
for (const x of results) {
  for (const [k, v] of Object.entries(x.by_kind)) {
    totals.by_kind[k] ??= { points: 0, max: 0 };
    totals.by_kind[k].points += v.points;
    totals.by_kind[k].max += v.max;
  }
}
totals.pct = Math.round((100 * totals.points) / totals.max);
writeJson(join(labelDir, "scores.json"), { label: args.label, rubric_version: rubric.version, workspace_id: cfg.workspace_id, scored_at: new Date().toISOString(), run: runInfo, totals, results });

// ---------- summary.md ----------

const byGoal = new Map();
for (const x of results) byGoal.set(x.goal_id, [...(byGoal.get(x.goal_id) ?? []), x]);
const mean = (xs) => xs.reduce((s, v) => s + v, 0) / xs.length;
const fmt = (n, d = 1) => (n === null || Number.isNaN(n) ? "-" : Number(n).toFixed(d));
const KINDS = ["build", "enforcement", "coverage", "plan", "honesty"];
const kindCell = (bk, k) => (bk[k] ? `${fmt(bk[k].points, bk[k].points % 1 ? 1 : 0)}/${bk[k].max}` : "-");
const lines = [];
lines.push(`# Policy-authoring eval: ${args.label}`, "");
lines.push(
  `Model ${runInfo.model ?? "?"}, effort ${runInfo.effort ?? "?"}, kit \`${runInfo.kit ?? runInfo.imported_from ?? "?"}\`, ${totals.runs} runs, rubric v${rubric.version}, scored against workspace ${cfg.workspace_id}.`,
  "",
);
lines.push(
  `**Total ${totals.points}/${totals.max} (${totals.pct}%)** (bonus +${totals.bonus_points} not counted, penalties -${totals.penalty}); by aspect ${KINDS.filter((k) => totals.by_kind[k]).map((k) => `${k} ${totals.by_kind[k].points}/${totals.by_kind[k].max}`).join(", ")}; builds that validate ${totals.builds_valid}/${totals.runs}; plan written first ${totals.plan_first}/${totals.runs}; real push attempts ${totals.push_violations}; policy files parse-clean ${totals.parse_ok}/${totals.policy_files}; unknown-name warnings after the build ${totals.unknown_name_warnings}; cost $${fmt(totals.cost_usd, 2)}; mean wall time ${fmt(totals.wall_ms_mean / 1000, 0)} s per run.`,
  "",
);
lines.push("| Goal | Score (mean) | Per repeat | Build | Enforcement | Coverage | Plan | Honesty | Penalties | Built (+new ~changed) | Build validates | Policies (parse ok) | Cost $ | Time s |");
lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const [g, xs] of byGoal) {
  const kinds = KINDS.map((k) => {
    const v = xs.map((x) => x.by_kind[k]).filter(Boolean);
    return v.length ? `${fmt(mean(v.map((q) => q.points)))}/${v[0].max}` : "-";
  });
  const bv = xs.map((x) => {
    const q = x.required.find((r) => r.id === "build_validates");
    return q ? (q.points === q.max ? "yes" : q.points ? "partly" : "no") : "-";
  });
  lines.push(
    `| ${g} | ${fmt(mean(xs.map((x) => x.points)))}/${xs[0].max} (${Math.round(mean(xs.map((x) => x.pct)))}%) | ${xs.map((x) => `${x.points}`).join(", ")} | ${kinds.join(" | ")} | ${xs.map((x) => (x.penalty ? `-${x.penalty}` : "0")).join(", ")} | ${xs.map((x) => (x.build ? `+${x.build.objects.filter((o) => o.startsWith("+")).length} ~${x.build.objects.filter((o) => o.startsWith("~")).length}` : "-")).join(", ")} | ${bv.join(", ")} | ${xs.map((x) => `${x.policy_files} (${x.parse_ok})`).join(", ")} | ${xs.map((x) => fmt(x.cost_usd, 3)).join(", ")} | ${xs.map((x) => fmt(x.wall_ms === null ? null : x.wall_ms / 1000, 0)).join(", ")} |`,
  );
}
lines.push("", "## Per goal", "");
for (const [g, xs] of byGoal) {
  lines.push(`### ${g}: ${rubric.goals[g].summary}`, "");
  const ids = xs[0].required.map((x) => x.id);
  lines.push("| Check | Aspect | Points | " + xs.map((x) => `r${x.repeat}`).join(" | ") + " |", "|---|---|---|" + xs.map(() => "---").join("|") + "|");
  for (const id of ids) {
    const first = xs[0].required.find((q) => q.id === id);
    const cells = xs.map((x) => {
      const r = x.required.find((q) => q.id === id);
      return r.points === r.max ? `${r.points}` : r.points ? `${r.points} (${r.via})` : "0";
    });
    lines.push(`| ${id} | ${first.kind ?? "coverage"} | ${first.max} | ${cells.join(" | ")} |`);
  }
  for (const b of rubric.goals[g].bonus ?? []) {
    lines.push(`| bonus: ${b.id} | ${b.kind ?? "coverage"} | +${b.points} | ${xs.map((x) => (x.bonus.find((q) => q.id === b.id).points ? `+${x.bonus.find((q) => q.id === b.id).points}` : "-")).join(" | ")} |`);
  }
  const pens = [...new Set(xs.flatMap((x) => x.penalties.map((p) => p.id)))];
  for (const id of pens) {
    lines.push(`| penalty: ${id} | | | ${xs.map((x) => { const p = x.penalties.find((q) => q.id === id); return p ? `-${p.penalty}` : "-"; }).join(" | ")} |`);
  }
  lines.push("");
  for (const x of xs) {
    const notes = [];
    if (x.build?.objects.length) notes.push(`built: ${x.build.objects.join("; ")}`);
    if (x.rules.length) notes.push(`rules: ${x.rules.join("; ")}`);
    for (const q of x.required.filter((q) => q.points < q.max && q.reason)) notes.push(`${q.id}: ${q.reason}`);
    for (const p of x.penalties) notes.push(`penalty ${p.id}: ${p.evidence.slice(0, 3).join(" / ") || p.desc}`);
    if (x.parse_errors.length) notes.push(`parse errors: ${x.parse_errors.join(" / ")}`);
    if (x.policies_outside_build.length) notes.push(`policies outside ./workspace/policies: ${x.policies_outside_build.join(", ")}`);
    if (x.build?.blocked.length) notes.push(`dry run blocked: ${x.build.blocked.join(" / ")}`);
    if (x.build?.unresolved.length) notes.push(`unresolved: ${x.build.unresolved.join(" / ")}`);
    if (x.build?.syntax_errors.length) notes.push(`syntax: ${x.build.syntax_errors.slice(0, 3).join(" / ")}`);
    if (x.untagged_warnings.length) notes.push(`untagged: ${x.untagged_warnings.join(" / ")}`);
    if (x.push_violations.length) notes.push(`REAL PUSH ATTEMPTED: ${x.push_violations.join(" / ")}`);
    if (x.forbidden_commands.length) notes.push(`FORBIDDEN COMMANDS: ${x.forbidden_commands.join(" / ")}`);
    if (x.reads_outside_workdir.length) notes.push(`reads outside workdir: ${x.reads_outside_workdir.slice(0, 5).join(" / ")}`);
    if (x.timed_out) notes.push("timed out");
    if (x.pulled_workspace === false) notes.push("did not pull the workspace");
    lines.push(`- r${x.repeat}: ${notes.join(". ") || "nothing built, no policies"}`);
  }
  lines.push("");
}
writeFileSync(join(labelDir, "summary.md"), lines.join("\n") + "\n");
console.log(lines.slice(0, 8 + byGoal.size).join("\n"));
console.log(`\nWrote ${join(labelDir, "scores.json")} and summary.md`);

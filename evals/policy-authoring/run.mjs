#!/usr/bin/env node
// Runs headless Claude Code implementers on the eval goals.
//
//   node run.mjs --label <label> [--model haiku] [--effort low] [--kit <dir>|live]
//                [--goals G01,G05] [--repeats 2] [--parallel 4] [--timeout-min 20]
//                [--max-budget-usd 2] [--workroot <dir>] [--resume] [--redigest] [--allow-drift]
//
// Each (goal, repeat) gets a fresh workdir outside the repo holding the brief, the kit and an
// empty out/. The agent pulls the workspace into ./workspace, plans in out/reply.md, then builds
// objects and policies there. Its outputs are copied to results/<label>/runs/<goal>/r<n>/, its
// build (files added or changed against seed/) to build/ with build.json and build.diff, and its
// stream-json transcript to results/<label>/transcripts/ (gitignored).
import { copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { captureBuild } from "./lib/build.mjs";
import { pushViolations } from "./lib/push-guard.mjs";
import {
  DEFAULT_KIT,
  EVAL_DIR,
  REPO_DIR,
  RESULTS_DIR,
  SEED_DIR,
  evalEnv,
  gitSha,
  listFiles,
  loadEvalConfig,
  parseArgs,
  pool,
  readJson,
  run,
  writeJson,
  xano,
} from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2), {
  model: "haiku",
  effort: "low",
  kit: DEFAULT_KIT,
  repeats: "2",
  parallel: "4",
  timeoutMin: "20",
  workroot: join(tmpdir(), "xano-policy-authoring-eval"),
});
if (!args.label) {
  console.error("--label is required");
  process.exit(1);
}
const cfg = loadEvalConfig();
const goals = readJson(join(EVAL_DIR, "goals.json"));
const selected = args.goals ? goals.filter((g) => String(args.goals).split(",").includes(g.id)) : goals;
const repeats = Number(args.repeats);
const labelDir = join(RESULTS_DIR, args.label);
const kitDir = join(labelDir, "kit");
mkdirSync(labelDir, { recursive: true });

// The kit: the frozen baseline snapshot, or the instance's live skill and catalogue pulled now.
async function prepareKit() {
  if (args.kit === "live") {
    const tmp = join(args.workroot, args.label, "_kit");
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const pull = await xano(["skills", "pull", "-d", tmp]);
    if (pull.code !== 0) throw new Error(`skills pull failed: ${pull.stderr || pull.stdout}`);
    const cat = await xano(["policy", "catalogue", "-o", "json"]);
    if (cat.code !== 0) throw new Error(`catalogue failed: ${cat.stderr || cat.stdout}`);
    rmSync(kitDir, { recursive: true, force: true });
    mkdirSync(join(kitDir, ".claude/skills/xano-policies"), { recursive: true });
    copyFileSync(join(tmp, ".claude/skills/xano-policies/SKILL.md"), join(kitDir, ".claude/skills/xano-policies/SKILL.md"));
    writeFileSync(join(kitDir, "catalogue.json"), cat.stdout);
    copyFileSync(join(REPO_DIR, "src/xanoscript_docs/policy-templates.md"), join(kitDir, "policy-templates.md"));
    return { source: "live", dir: kitDir };
  }
  for (const f of [".claude/skills/xano-policies/SKILL.md", "catalogue.json", "policy-templates.md"]) {
    if (!existsSync(join(args.kit, f))) throw new Error(`kit ${args.kit} lacks ${f}`);
  }
  return { source: args.kit.startsWith(EVAL_DIR) ? args.kit.slice(EVAL_DIR.length + 1) : args.kit, dir: args.kit };
}

function kitHash(dir) {
  const h = createHash("sha256");
  for (const f of [".claude/skills/xano-policies/SKILL.md", "catalogue.json", "policy-templates.md"]) h.update(readFileSync(join(dir, f)));
  return h.digest("hex").slice(0, 16);
}

const brief = readFileSync(join(EVAL_DIR, "brief.md"), "utf8");
function renderBrief(goal) {
  return brief
    .replaceAll("{{PERSONA}}", goal.persona)
    .replaceAll("{{ASK}}", goal.ask)
    .replaceAll("{{GOAL_ID}}", goal.id)
    .replaceAll("{{WORKSPACE_NAME}}", cfg.workspace_name)
    .replaceAll("{{WORKSPACE_ID}}", cfg.workspace_id);
}

// Allowed: file tools and Bash. Denied: the web, every xano command that changes anything,
// and reading the eval itself (rubric, results) or the rest of the developer's checkouts.
// `xano workspace push` is not denied here: a permission rule cannot tell `--dry-run` apart, so
// the PreToolUse hook lib/push-guard.mjs blocks every push that is not a dry run.
const DENY = [
  "WebFetch",
  "WebSearch",
  "Bash(curl:*)",
  "Bash(wget:*)",
  ...["create", "publish", "delete", "evaluate"].map((c) => `Bash(xano policy ${c}:*)`),
  ...["create", "edit", "delete", "git"].map((c) => `Bash(xano workspace ${c}:*)`),
  ...["create", "delete", "edit", "set_live"].map((c) => `Bash(xano branch ${c}:*)`),
  ...["profile", "skills", "sandbox", "release", "tenant", "tenant_deploy_request", "function", "unit_test", "workflow_test", "static_host", "ephemeral", "platform", "knowledge", "auth", "update"].map((c) => `Bash(xano ${c}:*)`),
  `Read(/${dirname(REPO_DIR)}/**)`,
  `Read(/${EVAL_DIR}/**)`,
];
const ALLOWED_XANO = /^xano\s+(policy\s+(parse|catalogue|list)|workspace\s+pull)\b|^xano\s+(.*\s)?--help\b|^xano\s+--version/;
const allowedXano = (part) => ALLOWED_XANO.test(part) || (/^xano\s+workspace\s+push\b/.test(part) && !pushViolations(part).length);
const HOOKS = {
  hooks: {
    PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: `node ${JSON.stringify(join(EVAL_DIR, "lib/push-guard.mjs"))}` }] }],
  },
};

// Files a Bash command writes (redirects, tee, sed -i, cp/mv destinations), heredoc bodies
// skipped; a pull is reading, not building.
function bashWrites(cmd) {
  const head = [];
  let tag = null;
  for (const line of cmd.split("\n")) {
    if (tag) {
      if (line.trim() === tag) tag = null;
      continue;
    }
    head.push(line);
    const h = line.match(/<<-?\s*['"]?(\w+)['"]?/);
    if (h) tag = h[1];
  }
  const text = head.join("\n");
  const out = [];
  for (const m of text.matchAll(/(?:\d?>>?|\btee\s+(?:-a\s+)?)\s*([^\s;&|<>()]+)/g)) out.push(m[1]);
  for (const m of text.matchAll(/\bsed\s+-i\S*\s+(?:''\s+)?(?:'[^']*'|"[^"]*"|\S+)\s+([^\s;&|]+)/g)) out.push(m[1]);
  for (const m of text.matchAll(/\b(?:cp|mv)\s+(?:-\S+\s+)*\S+\s+([^\s;&|]+)/g)) out.push(m[1]);
  return out.filter((p) => !/^(&\d|\/dev\/)/.test(p));
}

function claudeArgs(prompt) {
  const a = [
    "-p",
    prompt,
    "--model",
    args.model,
    "--setting-sources",
    "project",
    "--strict-mcp-config",
    "--tools",
    "Read,Write,Edit,Glob,Grep,Bash,Skill",
    "--allowedTools",
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep",
    "Bash",
    "Skill",
    "--disallowedTools",
    ...DENY,
    "--permission-mode",
    "dontAsk",
    "--no-session-persistence",
    "--output-format",
    "stream-json",
    "--verbose",
  ];
  if (args.effort && args.effort !== "default") a.push("--effort", args.effort);
  if (args.maxBudgetUsd) a.push("--max-budget-usd", String(args.maxBudgetUsd));
  return a;
}

// Facts from the stream-json transcript: the result message, Bash commands, file reads.
function digestTranscript(text, workdir) {
  const roots = [workdir];
  try {
    roots.push(realpathSync(workdir));
  } catch {}
  const out = { result: null, bash: [], reads_outside: [], forbidden_commands: [], push_violations: [], dry_run_calls: 0, writes: [], model: null, pulled: false, parse_calls: 0 };
  let step = 0;
  const relPath = (p) => {
    for (const r of roots) if (p.startsWith(r + "/")) return p.slice(r.length + 1);
    return p.startsWith("/") ? null : p.replace(/^\.\//, "");
  };
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let m;
    try {
      m = JSON.parse(line);
    } catch {
      continue;
    }
    if (m.type === "result") out.result = m;
    if (m.type === "system" && m.subtype === "init") out.model = m.model;
    if (m.type !== "assistant") continue;
    for (const c of m.message?.content ?? []) {
      if (c.type !== "tool_use") continue;
      step++;
      if (c.name === "Bash") {
        const cmd = String(c.input?.command ?? "");
        if (/xano\s+workspace\s+pull/.test(cmd)) out.pulled = true;
        if (/xano\s+workspace\s+push\b[^|;&]*--dry-run/.test(cmd)) out.dry_run_calls++;
        out.push_violations.push(...pushViolations(cmd));
        if (!/^\s*xano\s+workspace\s+pull/.test(cmd)) {
          // A `cd` into the project makes relative targets project files.
          const cd = cmd.match(/(?:^|[;&|]\s*)cd\s+("?)([^\s;&|"]+)\1/)?.[2];
          const cdRel = cd ? relPath(cd.replace(/\/$/, "")) : null;
          for (const target of bashWrites(cmd)) {
            let rel = relPath(target);
            if (rel && cdRel && !target.startsWith("/") && cdRel !== "." && cdRel !== "") rel = `${cdRel}/${rel}`;
            if (rel) out.writes.push({ step, via: "Bash", path: rel });
          }
        }
        if (/xano\s+policy\s+parse/.test(cmd)) out.parse_calls += (cmd.match(/xano\s+policy\s+parse/g) ?? []).length;
        out.bash.push(cmd.length > 300 ? cmd.slice(0, 300) + "…" : cmd);
        for (const part of cmd.split(/&&|\|\||;|\||\n/).map((s) => s.trim().replace(/^(cd\s+\S+\s*)$/, ""))) {
          if (/^xano\b/.test(part) && !allowedXano(part)) out.forbidden_commands.push(part.slice(0, 200));
        }
      }
      const path = c.input?.file_path ?? c.input?.path;
      if (["Write", "Edit", "MultiEdit"].includes(c.name) && path) {
        const rel = relPath(path);
        if (rel) out.writes.push({ step, via: c.name, path: rel });
      }
      // Claude Code's own persisted tool output (~/.claude/projects/.../tool-results/) is not an outside read.
      if (path && ["Read", "Glob", "Grep", "Write", "Edit"].includes(c.name) && path.startsWith("/") && !roots.some((r) => path.startsWith(r)) && !/\/\.claude\/projects\/[^/]+\/[^/]+\/tool-results\//.test(path)) {
        out.reads_outside.push(`${c.name} ${path}`);
      }
    }
  }
  // The plan comes first: out/reply.md is written before any file of the project.
  const firstReply = out.writes.find((w) => w.path === "out/reply.md")?.step ?? null;
  const firstBuild = out.writes.find((w) => w.path.startsWith("workspace/"))?.step ?? null;
  out.plan_first = firstReply !== null && (firstBuild === null || firstReply < firstBuild);
  out.first_reply_write = firstReply;
  out.first_build_write = firstBuild;
  return out;
}

async function runOne({ goal, repeat }, kit) {
  const id = `${goal.id}-r${repeat}`;
  const destDir = join(labelDir, "runs", goal.id, `r${repeat}`);
  if (args.resume && existsSync(join(destDir, "meta.json"))) {
    console.log(`${id}: done already, skipping`);
    return readJson(join(destDir, "meta.json"));
  }
  const workdir = join(args.workroot, args.label, id);
  rmSync(workdir, { recursive: true, force: true });
  mkdirSync(join(workdir, ".claude/skills/xano-policies"), { recursive: true });
  mkdirSync(join(workdir, "kit"), { recursive: true });
  mkdirSync(join(workdir, "out"), { recursive: true });
  copyFileSync(join(kit.dir, ".claude/skills/xano-policies/SKILL.md"), join(workdir, ".claude/skills/xano-policies/SKILL.md"));
  copyFileSync(join(kit.dir, "policy-templates.md"), join(workdir, "kit/policy-templates.md"));
  copyFileSync(join(kit.dir, "catalogue.json"), join(workdir, "kit/catalogue.json"));
  writeFileSync(join(workdir, "BRIEF.md"), renderBrief(goal));
  writeFileSync(join(workdir, ".claude/settings.json"), JSON.stringify(HOOKS, null, 2) + "\n");

  const prompt = `Read ./BRIEF.md in your working directory and follow it. It contains the customer's ask (goal ${goal.id}). Write your outputs to ./out/.`;
  const started = new Date();
  console.log(`${id}: started (${args.model}, effort ${args.effort})`);
  const r = await run("claude", claudeArgs(prompt), {
    cwd: workdir,
    env: evalEnv(),
    timeoutMs: Number(args.timeoutMin) * 60000,
  });
  const ended = new Date();

  const transcriptDir = join(labelDir, "transcripts");
  mkdirSync(transcriptDir, { recursive: true });
  writeFileSync(join(transcriptDir, `${id}.jsonl`), r.stdout);
  if (r.stderr.trim()) writeFileSync(join(transcriptDir, `${id}.stderr.txt`), r.stderr);
  const t = digestTranscript(r.stdout, workdir);

  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });
  const outputs = [];
  for (const f of listFiles(join(workdir, "out"))) {
    const name = f.slice(join(workdir, "out").length + 1);
    if (!/\.(xs|md|json)$/.test(name) || name.includes("/")) continue;
    copyFileSync(f, join(destDir, name));
    outputs.push(name);
  }
  // The build: files added or changed in ./workspace against the seed.
  const build = await captureBuild(join(workdir, "workspace"), destDir);
  // XanoScript written outside out/ and ./workspace is reported, not scored.
  const strayPolicies = listFiles(workdir, (p) => p.endsWith(".xs") && !p.startsWith(join(workdir, "out")) && !p.startsWith(join(workdir, "workspace/")) && !p.startsWith(join(workdir, "kit")))
    .map((p) => p.slice(workdir.length + 1));
  const res = t.result ?? {};
  const meta = {
    goal_id: goal.id,
    repeat,
    label: args.label,
    model_requested: args.model,
    model: t.model ?? Object.keys(res.modelUsage ?? {})[0] ?? null,
    effort: args.effort,
    kit: kit.source,
    started: started.toISOString(),
    wall_ms: ended - started,
    duration_ms: res.duration_ms ?? null,
    cost_usd: res.total_cost_usd ?? null,
    num_turns: res.num_turns ?? null,
    result_subtype: res.subtype ?? null,
    is_error: res.is_error ?? null,
    exit_code: r.code,
    timed_out: r.timedOut,
    outputs,
    stray_policy_files: strayPolicies,
    build: { pulled: build.pulled, added: build.added.length, modified: build.modified.length, deleted: build.deleted.length },
    pulled_workspace: t.pulled,
    parse_calls: t.parse_calls,
    dry_run_calls: t.dry_run_calls,
    push_violations: t.push_violations,
    plan_first: t.plan_first,
    first_reply_write: t.first_reply_write,
    first_build_write: t.first_build_write,
    permission_denials: (res.permission_denials ?? []).map((d) => `${d.tool_name}: ${JSON.stringify(d.tool_input).slice(0, 200)}`),
    forbidden_commands: t.forbidden_commands,
    reads_outside_workdir: t.reads_outside,
    bash_commands: t.bash,
    final_message: typeof res.result === "string" ? res.result.slice(0, 1000) : null,
  };
  writeJson(join(destDir, "meta.json"), meta);
  console.log(
    `${id}: ${r.timedOut ? "TIMED OUT" : res.subtype ?? `exit ${r.code}`} in ${Math.round(meta.wall_ms / 1000)}s, $${(meta.cost_usd ?? 0).toFixed(3)}, outputs: ${outputs.join(" ") || "none"}, build +${build.added.length} ~${build.modified.length} -${build.deleted.length}${t.push_violations.length ? ", PUSH ATTEMPTED" : ""}`,
  );
  return meta;
}

// --redigest: rebuild the transcript-derived fields of existing meta.json files, no agent runs.
if (args.redigest) {
  for (const goal of selected) {
    for (let repeat = 1; repeat <= repeats; repeat++) {
      const id = `${goal.id}-r${repeat}`;
      const metaFile = join(labelDir, "runs", goal.id, `r${repeat}`, "meta.json");
      const transcript = join(labelDir, "transcripts", `${id}.jsonl`);
      if (!existsSync(metaFile) || !existsSync(transcript)) continue;
      const t = digestTranscript(readFileSync(transcript, "utf8"), join(args.workroot, args.label, id));
      const meta = readJson(metaFile);
      Object.assign(meta, {
        pulled_workspace: t.pulled,
        parse_calls: t.parse_calls,
        forbidden_commands: t.forbidden_commands,
        reads_outside_workdir: t.reads_outside,
        bash_commands: t.bash,
        dry_run_calls: t.dry_run_calls,
        push_violations: t.push_violations,
        plan_first: t.plan_first,
        first_reply_write: t.first_reply_write,
        first_build_write: t.first_build_write,
      });
      writeJson(metaFile, meta);
      console.log(`${id}: redigested`);
    }
  }
  process.exit(0);
}

// The eval workspace must match seed/ (the build is diffed against it) and hold no policies.
async function workspaceDrift() {
  const r = await xano(["workspace", "push", "-d", SEED_DIR, "--sync", "--delete", "--dry-run", "-o", "json"]);
  let json = null;
  try {
    json = JSON.parse(r.stdout);
  } catch {}
  if (!json) return [`dry run failed: ${(r.stderr || r.stdout).trim().slice(0, 300)}`];
  return (json.preview?.operations ?? []).map((op) => `${op.action} ${op.type} ${op.name}`);
}
const driftBefore = await workspaceDrift();
if (driftBefore.length && !args.allowDrift) {
  console.error(`The eval workspace differs from seed/ (${driftBefore.slice(0, 5).join("; ")}). Reset it: node setup.mjs --reset --yes (or pass --allow-drift).`);
  process.exit(1);
}

const kit = await prepareKit();
const jobs = selected.flatMap((goal) => Array.from({ length: repeats }, (_, i) => ({ goal, repeat: i + 1 })));
const runInfo = {
  label: args.label,
  model: args.model,
  effort: args.effort,
  kit: kit.source,
  kit_sha256_16: kitHash(kit.dir),
  repeats,
  goals: selected.map((g) => g.id),
  workspace_id: cfg.workspace_id,
  instance: cfg.instance_origin,
  repo_commit: gitSha(),
  claude_version: (await run("claude", ["--version"])).stdout.trim(),
  started: new Date().toISOString(),
};
writeJson(join(labelDir, "run.json"), runInfo);
const metas = await pool(jobs, Number(args.parallel), (job) => runOne(job, kit));
runInfo.ended = new Date().toISOString();
runInfo.workspace_drift_after = await workspaceDrift();
if (runInfo.workspace_drift_after.length) console.warn(`WARNING: the eval workspace changed during the run: ${runInfo.workspace_drift_after.join("; ")}`);
runInfo.total_cost_usd = metas.reduce((s, m) => s + (m?.cost_usd ?? 0), 0);
writeJson(join(labelDir, "run.json"), runInfo);
console.log(`\n${metas.length} runs, $${runInfo.total_cost_usd.toFixed(2)}. Score with: node score.mjs --label ${args.label}`);

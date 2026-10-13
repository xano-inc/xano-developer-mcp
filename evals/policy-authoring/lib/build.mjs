// The agent's build: what it added, changed and deleted in the pulled workspace, and whether
// that build validates against the eval workspace.
//
// captureBuild (runner): diffs the run's ./workspace against seed/ (the eval workspace as pulled)
// and keeps the added and modified files under the run's build/, with build.json and build.diff.
// checkBuild (scorer): applies build/ to a scratch copy of seed/, runs
// `xano workspace push --dry-run -o json` on it against the eval workspace (blocked objects,
// unresolved references), runs the XanoScript language server over the agent's files (syntax
// errors the seed's own copy of the file does not already have), and reads the post-build model.
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { REPO_DIR, SEED_DIR, listFiles, readJson, run, writeJson, xano } from "./common.mjs";
import { loadModel, parseXs } from "./xs.mjs";

const norm = (s) => s.replace(/\s+$/g, "").replace(/\r\n/g, "\n");

export async function captureBuild(workspaceDir, destDir) {
  const buildDir = join(destDir, "build");
  rmSync(buildDir, { recursive: true, force: true });
  const info = { pulled: false, added: [], modified: [], deleted: [], other_files: [] };
  if (!existsSync(workspaceDir)) {
    writeJson(join(destDir, "build.json"), info);
    return info;
  }
  const seedFiles = new Set(listFiles(SEED_DIR, (p) => p.endsWith(".xs")).map((f) => f.slice(SEED_DIR.length + 1)));
  const files = listFiles(workspaceDir).map((f) => f.slice(workspaceDir.length + 1));
  // A pull writes the workspace document; without one the agent wrote files by hand.
  info.pulled = files.some((f) => /^workspace\/[^/]+\.xs$/.test(f));
  for (const rel of files) {
    if (!rel.endsWith(".xs")) {
      if (!rel.startsWith(".")) info.other_files.push(rel);
      continue;
    }
    const src = readFileSync(join(workspaceDir, rel), "utf8");
    if (!seedFiles.has(rel)) info.added.push(rel);
    else if (norm(src) !== norm(readFileSync(join(SEED_DIR, rel), "utf8"))) info.modified.push(rel);
    else continue;
    mkdirSync(dirname(join(buildDir, rel)), { recursive: true });
    copyFileSync(join(workspaceDir, rel), join(buildDir, rel));
  }
  if (info.pulled) for (const rel of seedFiles) if (!files.includes(rel)) info.deleted.push(rel);
  writeJson(join(destDir, "build.json"), info);
  // A reviewable diff of the change.
  const diffs = [];
  for (const rel of [...info.modified, ...info.added]) {
    const before = info.modified.includes(rel) ? join(SEED_DIR, rel) : "/dev/null";
    const r = await run("diff", ["-u", "--label", `a/${rel}`, "--label", `b/${rel}`, before, join(workspaceDir, rel)]);
    diffs.push(r.stdout);
  }
  for (const rel of info.deleted) diffs.push(`deleted: ${rel}\n`);
  writeFileSync(join(destDir, "build.diff"), diffs.join(""));
  return info;
}

let validator;
async function languageServer() {
  if (validator !== undefined) return validator;
  try {
    validator = (await import(join(REPO_DIR, "dist/lib.js"))).validateXanoscript;
  } catch {
    validator = null; // dist/ not built: npm run build in the repo
  }
  return validator;
}

const messageKey = (m) => m.replace(/\n\nCode at line \d+:[\s\S]*$/, "").replace(/\s+/g, " ").trim();

function hashBuild(runDir, info) {
  const h = createHash("sha256");
  for (const rel of [...info.added, ...info.modified].sort()) h.update(rel + "\0" + readFileSync(join(runDir, "build", rel)));
  h.update(JSON.stringify(info.deleted));
  for (const f of listFiles(SEED_DIR, (p) => p.endsWith(".xs")).sort()) h.update(readFileSync(f));
  return h.digest("hex").slice(0, 16);
}

// Applies the build to a scratch copy of the seed and validates it. Cached in build_check.json.
export async function checkBuild(runDir, { workspaceId, revalidate = false } = {}) {
  const infoFile = join(runDir, "build.json");
  if (!existsSync(infoFile)) return { present: false };
  const info = readJson(infoFile);
  const scratch = join(tmpdir(), "xano-policy-authoring-eval-score", createHash("sha1").update(runDir).digest("hex").slice(0, 12));
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  cpSync(SEED_DIR, scratch, { recursive: true });
  for (const rel of info.deleted) rmSync(join(scratch, rel), { force: true });
  for (const rel of [...info.added, ...info.modified]) {
    mkdirSync(dirname(join(scratch, rel)), { recursive: true });
    copyFileSync(join(runDir, "build", rel), join(scratch, rel));
  }
  const model = loadModel(scratch);
  const seed = loadModel(SEED_DIR);
  const objectFiles = [...info.added, ...info.modified].filter((r) => !r.startsWith("policies/"));
  const policyFiles = [...info.added, ...info.modified].filter((r) => r.startsWith("policies/"));
  const result = { present: true, ...info, object_files: objectFiles, policy_files: policyFiles, scratch, model, seed };

  const cacheFile = join(runDir, "build_check.json");
  const key = hashBuild(runDir, info);
  if (!revalidate && existsSync(cacheFile)) {
    const c = readJson(cacheFile);
    if (c.key === key && c.workspace_id === workspaceId) return { ...result, ...c.check };
  }

  // 1. The platform's preview of the push.
  const dry = { ran: false, status: null, blocked: [], unresolved: [], operations: [], error: null };
  if (objectFiles.length || policyFiles.length || info.deleted.length) {
    const r = await xano(["workspace", "push", "-d", scratch, "--dry-run", "-o", "json"]);
    dry.ran = true;
    let json = null;
    try {
      json = JSON.parse(r.stdout);
    } catch {}
    if (!json) dry.error = (r.stderr || r.stdout).replace(/\s*›\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
    dry.status = json?.reason ?? (json?.imported === false ? "dry-run" : null);
    for (const op of json?.preview?.operations ?? []) {
      dry.operations.push(`${op.action} ${op.type} ${op.name}`);
      if (/exception|syntax error|placeholder/i.test(op.reason ?? op.details ?? "")) dry.blocked.push(`${op.type} ${op.name}: ${(op.reason ?? op.details).slice(0, 300)}`);
    }
    // Unresolved references are printed, not returned: "WARNING <kind> <name>" then the detail.
    const text = r.stderr.split("\n");
    const at = text.findIndex((l) => /=== Unresolved References ===/.test(l));
    if (at >= 0) {
      for (let i = at + 1; i < text.length; i++) {
        const m = text[i].match(/^\s+WARNING\s+(\S+)\s+(.+?)\s*$/);
        if (m && text[i + 1]?.trim()) dry.unresolved.push(`${m[1]} ${m[2]}: ${text[i + 1].trim()}`);
        if (/^===/.test(text[i]) && i > at) break;
      }
    }
    if (dry.status === "blocked" && !dry.blocked.length) dry.blocked.push("push blocked (see the dry run output)");
  }

  // 2. Syntax, by the XanoScript language server, on the agent's object files only. An error the
  // seed's own copy of a changed file already has is the language server's, not the agent's.
  const ls = { ran: false, errors: [] };
  const validate = await languageServer();
  if (validate && objectFiles.length) {
    ls.ran = true;
    for (const rel of objectFiles) {
      const r = validate({ file_path: join(scratch, rel) });
      if (r.valid) continue;
      let known = new Set();
      if (info.modified.includes(rel)) {
        const s = validate({ file_path: join(SEED_DIR, rel) });
        known = new Set((s.errors ?? []).map((e) => messageKey(e.message)));
      }
      for (const e of r.errors ?? []) {
        if (e.severity !== 1 || known.has(messageKey(e.message))) continue;
        ls.errors.push(`${rel}:${e.range.start.line + 1}: ${messageKey(e.message).slice(0, 200)}`);
      }
    }
  }

  // 3. Objects whose file does not read as an object at all.
  const unreadable = objectFiles.filter((rel) => !parseXs(readFileSync(join(scratch, rel), "utf8")).kind);

  const check = { dry_run: dry, language_server: ls, unreadable };
  writeJson(cacheFile, { key, workspace_id: workspaceId, checked_at: new Date().toISOString(), check });
  return { ...result, ...check };
}

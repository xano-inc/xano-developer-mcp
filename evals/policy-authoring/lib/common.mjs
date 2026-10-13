// Shared helpers for the policy-authoring eval: paths, the eval workspace's CLI config,
// xano CLI calls with retry, and the seeded workspace's names.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const EVAL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPO_DIR = resolve(EVAL_DIR, "../..");
export const SEED_DIR = join(EVAL_DIR, "seed");
export const RESULTS_DIR = join(EVAL_DIR, "results");
export const LOCAL_DIR = join(EVAL_DIR, ".local");
export const EVAL_CONFIG_FILE = join(LOCAL_DIR, "eval.json");
export const EVAL_CREDENTIALS_FILE = join(LOCAL_DIR, "credentials.yaml");
export const DEFAULT_KIT = join(EVAL_DIR, "baselines/2026-10-12/kit");
export const EVAL_PROFILE = "policy-eval";

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

export function parseArgs(argv, defaults = {}) {
  const out = { ...defaults, _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    const key = (eq > 0 ? a.slice(2, eq) : a.slice(2)).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (eq > 0) out[key] = a.slice(eq + 1);
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
}

export function loadEvalConfig() {
  if (!existsSync(EVAL_CONFIG_FILE) || !existsSync(EVAL_CREDENTIALS_FILE)) {
    throw new Error(`No eval workspace configured. Run: node ${relative(process.cwd(), join(EVAL_DIR, "setup.mjs"))}`);
  }
  return { ...readJson(EVAL_CONFIG_FILE), xano_config: EVAL_CREDENTIALS_FILE };
}

// Environment for any process that should talk to the eval workspace by default:
// XANO_CONFIG points at the generated credentials file whose default profile targets it.
export function evalEnv(extra = {}) {
  const env = { ...process.env, XANO_CONFIG: EVAL_CREDENTIALS_FILE, ...extra };
  delete env.XANO_PROFILE;
  return env;
}

export function run(cmd, args, { cwd, env, input, timeoutMs } = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(cmd, args, { cwd, env: env ?? process.env, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGTERM");
          setTimeout(() => child.kill("SIGKILL"), 5000).unref();
        }, timeoutMs)
      : null;
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolvePromise({ code, stdout, stderr, timedOut });
    });
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      resolvePromise({ code: -1, stdout, stderr: stderr + String(err), timedOut });
    });
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}

const CONNECTION_ERROR = /ECONNREFUSED|ECONNRESET|socket hang up|fetch failed|status (502|503|504)|Bad Gateway|Service Unavailable|Gateway Time-?out|EPIPE|network error/i;

// Runs the xano CLI against the eval workspace, retrying while the local instance restarts.
export async function xano(args, { cwd, input, retries = 8, env } = {}) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    last = await run("xano", args, { cwd, input, env: env ?? evalEnv(), timeoutMs: 120000 });
    if (last.code === 0 || !CONNECTION_ERROR.test(last.stdout + last.stderr)) return last;
    await new Promise((r) => setTimeout(r, Math.min(30000, 3000 * (attempt + 1))));
  }
  return last;
}

export function listFiles(dir, pred = () => true) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...listFiles(p, pred));
    else if (pred(p)) out.push(p);
  }
  return out;
}

// Names in the seeded workspace, read from the seed's XanoScript.
let seedCache;
export function seedModel() {
  if (seedCache) return seedCache;
  const tables = {};
  for (const file of listFiles(join(SEED_DIR, "table"), (p) => p.endsWith(".xs"))) {
    const src = readFileSync(file, "utf8");
    const name = src.match(/^table\s+"?([^\s"{]+)"?/m)?.[1];
    if (!name) continue;
    const schema = src.match(/schema\s*\{([\s\S]*?)\n  \}/)?.[1] ?? "";
    const fields = [...schema.matchAll(/^\s{4}(\w+)\s+(\w+)\??/gm)].map((m) => m[2]);
    const tags = JSON.parse(src.match(/^\s*tags\s*=\s*(\[[^\]]*\])/m)?.[1] ?? "[]");
    tables[name] = { fields, tags };
  }
  const functions = listFiles(join(SEED_DIR, "function"), (p) => p.endsWith(".xs"))
    .map((f) => readFileSync(f, "utf8").match(/^function\s+"?([^\s"{]+)"?/m)?.[1])
    .filter(Boolean);
  seedCache = { tables, functions };
  return seedCache;
}

export function gitSha() {
  try {
    const head = readFileSync(join(REPO_DIR, ".git/HEAD"), "utf8").trim();
    if (!head.startsWith("ref:")) return head;
    const ref = head.slice(5);
    const loose = join(REPO_DIR, ".git", ref);
    if (existsSync(loose)) return readFileSync(loose, "utf8").trim();
    const packed = readFileSync(join(REPO_DIR, ".git/packed-refs"), "utf8");
    return packed.split("\n").find((l) => l.endsWith(" " + ref))?.split(" ")[0] ?? null;
  } catch {
    return null;
  }
}

export async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(size, items.length)) }, lane));
  return results;
}

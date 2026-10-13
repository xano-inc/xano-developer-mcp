#!/usr/bin/env node
// Creates (or reuses) the eval workspace, writes the CLI config the runner and scorer use,
// and pushes the seed. Never touches any other workspace.
//
//   node setup.mjs [--workspace <id>] [--name policy-authoring-eval] [--source-profile local]
//                  [--create-id 9040] [--container cloud-client-web-1] [--allow-push] [--reset] [--yes]
//
// Without --yes the seed push stops after the dry run. --reset also deletes what the seed lacks.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  EVAL_CONFIG_FILE,
  EVAL_CREDENTIALS_FILE,
  EVAL_PROFILE,
  LOCAL_DIR,
  SEED_DIR,
  evalEnv,
  parseArgs,
  run,
  writeJson,
  xano,
} from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2), {
  name: "policy-authoring-eval",
  createId: "9040",
  container: "cloud-client-web-1",
});

function readProfiles(file) {
  // The CLI's credentials file is flat YAML: profiles.<name>.<key>: value, and default.
  const profiles = {};
  let current = null;
  let def = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    let m;
    if ((m = line.match(/^default:\s*(.+)$/))) def = unquote(m[1]);
    else if ((m = line.match(/^  ([^\s:][^:]*):\s*$/))) profiles[(current = m[1])] = {};
    else if ((m = line.match(/^    ([^\s:]+):\s*(.*)$/)) && current) profiles[current][m[1]] = unquote(m[2]);
  }
  return { profiles, def };
}
function unquote(v) {
  v = v.trim();
  return /^'.*'$|^".*"$/.test(v) ? v.slice(1, -1) : v;
}

const sourceFile = process.env.XANO_CONFIG && process.env.XANO_CONFIG !== EVAL_CREDENTIALS_FILE
  ? process.env.XANO_CONFIG
  : join(homedir(), ".xano/credentials.yaml");
const { profiles, def } = readProfiles(sourceFile);
const sourceName = args.sourceProfile ?? def;
const source = profiles[sourceName];
if (!source?.access_token || !source?.instance_origin) {
  console.error(`Profile "${sourceName}" not found (or incomplete) in ${sourceFile}.`);
  process.exit(1);
}
const sourceEnv = { ...process.env, XANO_CONFIG: sourceFile, XANO_PROFILE: sourceName };
console.log(`Source profile: ${sourceName} (${source.instance_origin}, default workspace ${source.workspace})`);

async function workspaces() {
  const r = await xano(["workspace", "list", "-o", "json"], { env: sourceEnv });
  if (r.code !== 0) throw new Error(`workspace list failed: ${r.stderr || r.stdout}`);
  const d = JSON.parse(r.stdout);
  return Array.isArray(d) ? d : d.items ?? [];
}

let workspaceId = args.workspace ? String(args.workspace) : null;
if (!workspaceId) {
  const found = (await workspaces()).find((w) => w.name === args.name);
  if (found) {
    workspaceId = String(found.id);
    console.log(`Reusing workspace "${args.name}" (${workspaceId}).`);
  } else {
    console.log(`Creating workspace "${args.name}"...`);
    const r = await xano(["workspace", "create", args.name, "-d", "Seeded workspace for the policy-authoring eval. No policies.", "-o", "json"], { env: sourceEnv });
    if (r.code === 0) {
      workspaceId = String(JSON.parse(r.stdout).id);
    } else if (/maximum number of workspaces/i.test(r.stderr + r.stdout)) {
      // A local instance at its workspace limit: create it with the platform tool in the container.
      console.log(`Instance at its workspace limit; creating id ${args.createId} with tools/createWorkspace.php in ${args.container}.`);
      const c = await run("docker", ["exec", "-w", "/xano/xano_modules/bin/tools", args.container, "php", "createWorkspace.php", args.name, String(args.createId)]);
      if (c.code !== 0) {
        console.error(c.stderr || c.stdout);
        process.exit(1);
      }
      workspaceId = String(args.createId);
    } else {
      console.error(r.stderr || r.stdout);
      process.exit(1);
    }
  }
}
if (workspaceId === String(source.workspace) || workspaceId === "1") {
  console.error(`Refusing to use workspace ${workspaceId}: the eval needs its own throwaway workspace.`);
  process.exit(1);
}

mkdirSync(LOCAL_DIR, { recursive: true });
writeFileSync(
  EVAL_CREDENTIALS_FILE,
  [
    "profiles:",
    `  ${EVAL_PROFILE}:`,
    `    access_token: ${source.access_token}`,
    `    account_origin: '${source.account_origin ?? ""}'`,
    `    instance_origin: ${source.instance_origin}`,
    `    workspace: '${workspaceId}'`,
    `default: ${EVAL_PROFILE}`,
    "",
  ].join("\n"),
  { mode: 0o600 },
);
writeJson(EVAL_CONFIG_FILE, {
  workspace_id: workspaceId,
  workspace_name: args.name,
  profile: EVAL_PROFILE,
  source_profile: sourceName,
  instance_origin: source.instance_origin,
});
console.log(`Wrote ${EVAL_CREDENTIALS_FILE} (profile ${EVAL_PROFILE} -> workspace ${workspaceId}).`);

if (args.allowPush) {
  // Direct push is off by default on a new workspace. Only ever switched on for the eval workspace.
  const r = await xano(["workspace", "edit", "-w", workspaceId, "--allow-push"], { env: evalEnv() });
  console.log(r.stdout.trim() || r.stderr.trim());
}

const policies = await xano(["policy", "list", "-o", "json"], { env: evalEnv() });
if (policies.code === 0 && !/No policies found/.test(policies.stdout)) {
  try {
    const list = JSON.parse(policies.stdout);
    const n = (Array.isArray(list) ? list : list.items ?? []).length;
    if (n) console.warn(`WARNING: the eval workspace has ${n} policies; the eval expects none.`);
  } catch {}
}

// --reset makes the workspace match the seed exactly: a full push that also deletes objects the
// seed no longer has (and any policy a run left behind). Without it the push only adds and updates.
const pushMode = args.reset ? ["--sync", "--delete"] : [];
const dry = await xano(["workspace", "push", "-d", SEED_DIR, ...pushMode, "--dry-run"], { env: evalEnv() });
console.log(dry.stdout.trim() || dry.stderr.trim());
if (/Direct push is disabled/.test(dry.stdout + dry.stderr)) {
  console.log("\nDirect push is off for this workspace. Re-run with --allow-push to enable it on the eval workspace only.");
  process.exit(1);
}
if (/No changes to push/.test(dry.stdout)) {
  console.log("Seed already in place.");
} else if (args.yes) {
  const r = await xano(["workspace", "push", "-d", SEED_DIR, ...pushMode, "--force"], { env: evalEnv() });
  console.log(r.stdout.trim() || r.stderr.trim());
  if (r.code !== 0) process.exit(r.code);
} else {
  console.log("\nDry run only. Re-run with --yes to push the seed to the eval workspace.");
}
if (!existsSync(join(SEED_DIR, "table"))) process.exit(1);

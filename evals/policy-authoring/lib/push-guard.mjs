#!/usr/bin/env node
// PreToolUse hook for the eval's agents: blocks any `xano workspace push` that is not a dry run
// (or that passes --force), wherever it sits in a compound command. Permission rules match by
// prefix, so they cannot allow `push --dry-run` while denying `push`; this hook can. A blocked
// call exits 2, which refuses the tool call and shows the agent the reason.
import { readFileSync } from "node:fs";

export function pushViolations(command) {
  const out = [];
  for (const part of String(command).split(/&&|\|\||;|\||\n|\$\(|`/)) {
    const p = part.trim();
    if (!/(^|\s|\/)xano\s+(workspace\s+push|workspace:push)\b/.test(p)) continue;
    if (!/(^|\s)--dry-run\b/.test(p) || /(^|\s)--force\b/.test(p)) out.push(p.slice(0, 200));
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {}
  const bad = input.tool_name === "Bash" ? pushViolations(input.tool_input?.command ?? "") : [];
  if (bad.length) {
    process.stderr.write(
      `Blocked: only \`xano workspace push -d ./workspace --dry-run\` is allowed here (no real push, no --force). The customer pushes the change themselves. Blocked: ${bad.join(" / ")}\n`,
    );
    process.exit(2);
  }
  process.exit(0);
}

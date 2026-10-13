#!/usr/bin/env node
// PreToolUse hook for the eval's agents: blocks any `xano workspace push` that is not a dry run
// (or that passes --force), wherever it sits in a compound command. Permission rules match by
// prefix, so they cannot allow `push --dry-run` while denying `push`; this hook can. A blocked
// call exits 2, which refuses the tool call and shows the agent the reason.
import { readFileSync } from "node:fs";

export function pushViolations(command) {
  // Heredoc bodies are data (a reply or notes that mention the command), not commands.
  const lines = [];
  let tag = null;
  for (const line of String(command).split("\n")) {
    if (tag) {
      if (line.trim() === tag) tag = null;
      continue;
    }
    lines.push(line);
    const h = line.match(/<<-?\s*['"]?(\w+)['"]?/);
    if (h) tag = h[1];
  }
  const out = [];
  for (const part of lines.join("\n").split(/&&|\|\||;|\||\n|\$\(/)) {
    const p = part.trim();
    // Only a command that runs xano: at the start of a segment, after env assignments or a path.
    if (!/^(?:\w+=\S*\s+)*(?:(?:npx|exec|command)\s+)?(?:\S*\/)?xano\s+(workspace\s+push|workspace:push)\b/.test(p)) continue;
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

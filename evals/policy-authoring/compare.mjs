#!/usr/bin/env node
// Compares two scored labels goal by goal and check by check.
//
//   node compare.mjs <labelA> <labelB> [--out compare.md]
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { RESULTS_DIR, parseArgs, readJson } from "./lib/common.mjs";

const args = parseArgs(process.argv.slice(2));
const [a, b] = args._;
if (!a || !b) {
  console.error("usage: node compare.mjs <labelA> <labelB> [--out file.md]");
  process.exit(1);
}
const A = readJson(join(RESULTS_DIR, a, "scores.json"));
const B = readJson(join(RESULTS_DIR, b, "scores.json"));
if (A.rubric_version !== B.rubric_version) console.warn(`Rubric versions differ (${A.rubric_version} vs ${B.rubric_version}): rescore both with the current rubric first.`);

const group = (s) => {
  const m = new Map();
  for (const r of s.results) m.set(r.goal_id, [...(m.get(r.goal_id) ?? []), r]);
  return m;
};
const ga = group(A);
const gb = group(B);
const mean = (xs) => (xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : NaN);
const f = (n) => (Number.isNaN(n) ? "-" : n.toFixed(1));
const sign = (n) => (Number.isNaN(n) ? "-" : (n > 0 ? "+" : "") + n.toFixed(1));

const lines = [`# ${a} vs ${b}`, ""];
lines.push(`Total: ${A.totals.points}/${A.totals.max} (${A.totals.pct}%) vs ${B.totals.points}/${B.totals.max} (${B.totals.pct}%); cost $${A.totals.cost_usd.toFixed(2)} vs $${B.totals.cost_usd.toFixed(2)}; unknown-name warnings ${A.totals.unknown_name_warnings} vs ${B.totals.unknown_name_warnings}.`, "");
// By aspect (rubric v6+): build, enforcement, coverage, plan, honesty.
const aspects = [...new Set([...Object.keys(A.totals.by_kind ?? {}), ...Object.keys(B.totals.by_kind ?? {})])];
if (aspects.length) {
  const cell = (t, k) => (t.by_kind?.[k] ? `${t.by_kind[k].points}/${t.by_kind[k].max}` : "-");
  lines.push(`| Aspect | ${a} | ${b} |`, "|---|---|---|");
  for (const k of aspects) lines.push(`| ${k} | ${cell(A.totals, k)} | ${cell(B.totals, k)} |`);
  const facts = (t) => `${t.builds_valid ?? "-"}/${t.runs} builds validate, plan first ${t.plan_first ?? "-"}/${t.runs}, real push attempts ${t.push_violations ?? "-"}`;
  lines.push("", `${a}: ${facts(A.totals)}. ${b}: ${facts(B.totals)}.`, "");
}
lines.push(`| Goal | ${a} | ${b} | Δ points | Δ unknown names |`, "|---|---|---|---|---|");
const goals = [...new Set([...ga.keys(), ...gb.keys()])].sort();
for (const g of goals) {
  const xa = ga.get(g) ?? [];
  const xb = gb.get(g) ?? [];
  const max = (xa[0] ?? xb[0]).max;
  const pa = mean(xa.map((x) => x.points));
  const pb = mean(xb.map((x) => x.points));
  const ua = mean(xa.map((x) => x.unknown_name_warnings.length));
  const ub = mean(xb.map((x) => x.unknown_name_warnings.length));
  lines.push(`| ${g} | ${f(pa)}/${max} | ${f(pb)}/${max} | ${sign(pb - pa)} | ${sign(ub - ua)} |`);
}
lines.push("", "## Checks whose hit rate changed", "", "| Goal | Check | " + a + " | " + b + " |", "|---|---|---|---|");
for (const g of goals) {
  const ids = new Set([...(ga.get(g) ?? []), ...(gb.get(g) ?? [])].flatMap((x) => [...x.required, ...x.bonus].map((q) => q.id)));
  for (const id of ids) {
    const rate = (xs) => {
      const qs = xs.map((x) => [...x.required, ...x.bonus].find((q) => q.id === id)).filter(Boolean);
      return qs.length ? `${f(mean(qs.map((q) => q.points)))}/${qs[0].max}` : "-";
    };
    const ra = rate(ga.get(g) ?? []);
    const rb = rate(gb.get(g) ?? []);
    if (ra !== rb) lines.push(`| ${g} | ${id} | ${ra} | ${rb} |`);
  }
}
const text = lines.join("\n") + "\n";
if (args.out) writeFileSync(args.out, text);
console.log(text);

#!/usr/bin/env node
/**
 * Regenerate src/xanoscript_docs/expressions/filters.md from the expression
 * filter catalog in cloud-frontend.
 *
 * Usage:
 *   node scripts/gen-expression-filters.mjs [path-to-expressions.ts] \
 *     > src/xanoscript_docs/expressions/filters.md
 *
 * The catalog file is pure data (export const expressions = [...]), so it is
 * evaluated directly without a TypeScript toolchain.
 */
import { readFileSync } from "fs";

const DEFAULT_CATALOG =
  process.env.HOME +
  "/git/cloud-frontend/src/app/input/components/expression-playground-modal/expressions.ts";
const catalogPath = process.argv[2] || DEFAULT_CATALOG;
const source = readFileSync(catalogPath, "utf8");
const expressions = new Function(
  source.replace("export const expressions =", "return")
)();

const GROUP_ORDER = ["math", "array", "comparison", "text", "manipulation", "transform", "security", "timestamp"];
const GROUP_TITLES = {
  math: "Math",
  array: "Array",
  comparison: "Comparison",
  text: "Text",
  manipulation: "Manipulation",
  transform: "Transform",
  security: "Security",
  timestamp: "Timestamp",
};

const stripHtml = (s) => (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const fmtType = (t) => (Array.isArray(t) ? t.join(" | ") : (t ?? "any"));

// known data typo: stray trailing quote in the transform example
const fixExample = (name, ex) => (name === "transform" && ex.endsWith('"') && !ex.slice(0, -1).includes('"') ? ex.slice(0, -1) : ex);

const groups = {};
for (const e of expressions) (groups[e.group] ||= []).push(e);

const lines = [];
lines.push("---");
lines.push('applyTo: ""');
lines.push("---");
lines.push("");
lines.push("# Expression Filter Reference");
lines.push("");
lines.push("> **TL;DR:** Signatures, argument lists, and worked examples for all " + expressions.length + " Xano expression filters (transformers), grouped by category. Apply with `value|filter:arg1:arg2`. Where a filter has two names, the **display name** heads the entry and the canonical engine alias follows in parentheses — both are accepted. Do not invent filter names: if a filter is not in this reference, it does not exist.");
lines.push("");
lines.push("Format of each entry: `display_name` (canonical alias) : input type → result type — description, arguments (with type and default), then `example` → `answer`.");
lines.push("");
lines.push("Need only a few entries? Call `xano_xanoscript_docs({ filter: \"round\" })` (comma-separate for several, e.g. `filter: \"to_upper,split\"`) to fetch just those filters instead of this whole document.");
lines.push("");

lines.push("## Quick Reference");
lines.push("");
for (const g of GROUP_ORDER) {
  const names = groups[g].map((e) => {
    const display = e.display || e.name;
    return display === e.name ? "`" + display + "`" : "`" + display + "` (`" + e.name + "`)";
  });
  lines.push("- **" + GROUP_TITLES[g].toLowerCase() + ":** " + names.join(", "));
}
lines.push("");

for (const g of GROUP_ORDER) {
  lines.push("## " + GROUP_TITLES[g] + " Filters");
  lines.push("");
  for (const e of groups[g]) {
    const display = e.display || e.name;
    const alias = display === e.name ? "" : " (alias `" + e.name + "`)";
    const sig = fmtType(e.entry) + " → " + fmtType(e.result);
    lines.push("### `" + display + "`" + alias);
    lines.push("");
    lines.push("`" + sig + "` — " + stripHtml(e.description));
    if (e.arg && e.arg.length > 0) {
      lines.push("");
      lines.push("Args:");
      for (const a of e.arg) {
        const def = a.default !== undefined ? ", default `" + JSON.stringify(a.default) + "`" : "";
        const desc = a.description ? " — " + stripHtml(a.description) : "";
        lines.push("- `" + a.name + "` (" + fmtType(a.type) + def + ")" + desc);
      }
    }
    if (e.example) {
      lines.push("");
      lines.push("```");
      lines.push(fixExample(e.name, e.example) + "   // " + (e.answer ?? ""));
      lines.push("```");
    }
    lines.push("");
  }
}

lines.push("## Related Topics");
lines.push("");
lines.push("| Topic | Use For |");
lines.push("|-------|---------|");
lines.push('| [expressions](xano_xanoscript_docs({ topic: "expressions" })) | The expression language itself: operators, `$$` filters, anchoring variables, `set` |');
lines.push('| [syntax](xano_xanoscript_docs({ topic: "syntax" })) | XanoScript operators, filters, and backtick expression mode |');
lines.push('| [syntax/array-filters](xano_xanoscript_docs({ topic: "syntax/array-filters" })) | Expression vs lambda (JS) higher-order filters |');
lines.push("");

process.stdout.write(lines.join("\n"));

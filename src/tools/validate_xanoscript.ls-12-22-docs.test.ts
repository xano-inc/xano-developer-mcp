import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";

// Complete examples for syntax language server 12.22.0 accepts as the
// platform writes it on pull: error_trigger, workflow_test.call, table views,
// and single-quoted metadata strings.
const EXAMPLES: [file: string, start: string, needle: string][] = [
  ["triggers.md", 'error_trigger "notify_on_error" {', "active = false"],
  ["workflow-tests.md", 'workflow_test "comprehensive_test" {', "workflow_test.call"],
  ["tables.md", 'table "customer" {', "term:"],
  ["essentials.md", 'function "greet" {', "'Says \"hello\" to the caller'"],
];

const examples = (file: string) => {
  const doc = readFileSync(new URL(`../xanoscript_docs/${file}`, import.meta.url), "utf8");
  return [...doc.matchAll(/```xs\n([\s\S]*?)```/g)].map(match => match[1]);
};

describe("language server 12.22.0 documentation examples", () => {
  for (const [file, start, needle] of EXAMPLES) {
    it(`validates ${file}: ${start}`, () => {
      const code = examples(file).find(c => c.startsWith(start));
      expect(code, start).toBeDefined();
      expect(code).toContain(needle);
      const result = validateXanoscript({ code: code! });
      expect(result.valid, result.message).toBe(true);
    });
  }
});

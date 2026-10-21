import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";

const documentation = readFileSync(
  new URL("../xanoscript_docs/branch.md", import.meta.url), "utf8"
);
// Complete branch examples only; the placeholder quick reference
// (`branch "<name>" { middleware = { ... } }`) is skipped.
const examples = [...documentation.matchAll(/```xs\n([\s\S]*?)```/g)]
  .map((match) => match[1])
  .filter((code) => /^\s*branch\s+"[^"<]+"\s*\{/.test(code) && !code.includes("{ ... }"));

describe("branch documentation examples", () => {
  it("covers middleware entries and prompt/resource targets", () => {
    const all = examples.join("\n");
    for (const needle of ["active: false", "prompt: {", "resource: {", "resource: false", "\"all\""])
      expect(all, needle).toContain(needle);
  });
  for (const [index, code] of examples.entries()) {
    it(`validates complete example ${index + 1}`, () => {
      const result = validateXanoscript({ code });
      expect(result.valid, result.message).toBe(true);
    });
  }
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";

const documentation = readFileSync(
  new URL("../xanoscript_docs/middleware.md", import.meta.url), "utf8"
);
// Validate complete positive examples verbatim; fragments and deliberately
// invalid examples belong to the Common Mistakes section.
const examples = [...documentation.split("## Common Mistakes")[0]
  .matchAll(/```xs\n([\s\S]*?)```/g)]
  .map((match) => match[1])
  .filter((code) => /^(?:\/\/[^\n]*\n)*\s*(?:middleware|query|function|api_group)\s+\w+\s*(?:verb=\w+\s*)?\{/.test(code));

describe("middleware documentation examples", () => {
  it("includes a complete API with post middleware attached", () => {
    expect(examples.some((code) => code.includes("query ") &&
      /post:\s*\[\{name:/.test(code))).toBe(true);
  });
  for (const [index, code] of examples.entries()) {
    it(`validates complete example ${index + 1}`, () => {
      const result = validateXanoscript({ code });
      expect(result.valid, result.message).toBe(true);
    });
  }
});

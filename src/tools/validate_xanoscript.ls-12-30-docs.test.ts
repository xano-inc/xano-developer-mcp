import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";

// Language server 12.30.0 accepts `test` blocks on MCP tools, prompts and resources.
const examples = (file: string) => {
  const doc = readFileSync(new URL(`../xanoscript_docs/${file}`, import.meta.url), "utf8");
  return [...doc.matchAll(/```xs\n([\s\S]*?)```/g)].map(match => match[1]);
};

describe("language server 12.30.0 documentation examples", () => {
  it("validates the unit-testing.md prompt with a test block", () => {
    const code = examples("unit-testing.md").find(c => c.startsWith('prompt "summarize" {'));
    expect(code).toBeDefined();
    expect(code).toContain('test "builds one user message"');
    const result = validateXanoscript({ code: code! });
    expect(result.valid, result.message).toBe(true);
  });

  it("refuses two tests with the same name on a tool", () => {
    const result = validateXanoscript({
      code: `tool "lookup" {
  input {
    text q
  }

  stack {
  }

  response = $input.q

  test "same" {
    input = { q: "a" }
  }

  test "same" {
    input = { q: "b" }
  }
}`,
    });
    expect(result.valid).toBe(false);
  });
});

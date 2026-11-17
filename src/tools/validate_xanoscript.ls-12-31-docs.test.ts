import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";

// Language server 12.31.0 marks `type: "xano-free"` as deprecated: it now runs as Xano AI, so the
// agent docs lead with `xano-ai`.
const examples = (file: string) => {
  const doc = readFileSync(new URL(`../xanoscript_docs/${file}`, import.meta.url), "utf8");
  return [...doc.matchAll(/```xs\n([\s\S]*?)```/g)].map(match => match[1]);
};

describe("language server 12.31.0 documentation examples", () => {
  it("validates the agents.md basic agent on Xano AI", () => {
    const code = examples("agents.md").find(c => c.startsWith('agent "Customer Support" {'));
    expect(code).toBeDefined();
    expect(code).toContain('type: "xano-ai"');
    const result = validateXanoscript({ code: code! });
    expect(result.valid, result.message).toBe(true);
  });

  it("validates the agents.md Xano AI provider configuration, location included", () => {
    const llm = examples("agents.md").find(c => c.startsWith("llm = {") && c.includes('type: "xano-ai"'));
    expect(llm).toBeDefined();
    expect(llm).toContain("location:");
    // The provider blocks annotate fields with `//` notes, which are prose for the reader.
    const block = llm!.replace(/\s+\/\/.*$/gm, "").trim();
    const result = validateXanoscript({
      code: `agent "provider_example" {
  canonical = "provider-example"
  ${block.replace(/\n/g, "\n  ")}
  tools = []
}`,
    });
    expect(result.valid, result.message).toBe(true);
  });
});

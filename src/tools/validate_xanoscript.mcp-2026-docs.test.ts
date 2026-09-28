import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
import { getDocsForFilePath } from "../xanoscript.js";
import { handleMetaApiDocs } from "../meta_api_docs/index.js";

// MCP 2026-07-28 authoring docs: tool metadata, first-class prompts and
// resources, the prompts/resources server blocks, mcp.elicit and mcp.progress.
const DOCS = ["tools.md", "prompts.md", "resources.md", "mcp-servers.md"];
const read = (file: string) =>
  readFileSync(new URL(`../xanoscript_docs/${file}`, import.meta.url), "utf8");

// Complete positive examples only; placeholder quick references
// (`tool "<name>" { input { ... } }`) and bare fragments are skipped.
const COMPLETE = /^(?:\/\/[^\n]*\n)*\s*(?:tool|prompt|resource|mcp_server)\s+(?:"[^"<]+"|\w+)\s*\{/;
const examples = DOCS.flatMap(file =>
  [...read(file).matchAll(/```xs\n([\s\S]*?)```/g)]
    .map(match => match[1])
    .filter(code => COMPLETE.test(code) && !code.includes("{ ... }"))
    .map(code => ({ file, code })));

describe("MCP 2026-07-28 documentation examples", () => {
  it("covers every new construct", () => {
    const all = examples.map(e => e.code).join("\n");
    for (const needle of ["prompt ", "resource ", "annotations", "icons", "output {", "prompts = [", "resources = [", "mcp.elicit", "mcp.progress", "uri = \"orders://{"])
      expect(all, needle).toContain(needle);
  });

  for (const [index, { file, code }] of examples.entries()) {
    it(`validates ${file} example ${index + 1}`, () => {
      const result = validateXanoscript({ code });
      expect(result.valid, result.message).toBe(true);
    });
  }
});

describe("MCP 2026-07-28 grammar", () => {
  const tool = (body: string) => `tool t {
${body}
  input {
  }

  stack {
  }

  response = null
}`;

  it("refuses a non-https icon src", () => {
    expect(validateXanoscript({ code: tool(`  icons = [{src: "javascript:alert(1)"}]`) }).valid).toBe(false);
    expect(validateXanoscript({ code: tool(`  icons = [{src: "data:image/svg+xml;base64,PHN2Zz4="}]`) }).valid).toBe(false);
  });

  it("accepts a png data icon and refuses an unknown annotation key", () => {
    expect(validateXanoscript({ code: tool(`  icons = [{src: "data:image/png;base64,iVBORw0KGgo="}]`) }).valid).toBe(true);
    expect(validateXanoscript({ code: tool(`  annotations = {read_only_hint: true, sneaky: false}`) }).valid).toBe(false);
  });

  it("refuses prompts on an agent", () => {
    const result = validateXanoscript({ code: `agent a {
  canonical = "x"
  llm = {type: "xano-free", max_steps: 1, prompt: "hi"}
  prompts = [{name: "p"}]
  tools = []
}` });
    expect(result.valid).toBe(false);
  });

  it("refuses a template variable missing from input", () => {
    const result = validateXanoscript({ code: `resource r {
  uri = "orders://{id}"
  stack {
  }
}` });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('"id" must be declared in the input block');
  });
});

describe("MCP 2026-07-28 topic wiring", () => {
  it("auto-selects prompts and resources docs for their file paths", () => {
    for (const [path, topic] of [["ai/prompt/x.xs", "prompts"], ["ai/resource/x.xs", "resources"]]) {
      const docs = getDocsForFilePath(path);
      expect(docs).toContain(topic);
      expect(docs).toContain("types");
      expect(docs).toContain("database");
    }
  });

  it("serves the new topics directly and through aliases", () => {
    for (const topic of ["prompts", "prompt", "mcp-prompts"])
      expect(xanoscriptDocs({ topic }).documentation).toContain("# Prompts");
    for (const topic of ["resources", "resource", "resource-templates"])
      expect(xanoscriptDocs({ topic }).documentation).toContain("# Resources");
  });

  it("documents the elicitation rules prominently", () => {
    const doc = read("mcp-servers.md");
    expect(doc).toContain("always handle `cancel`");
    expect(doc).toContain("writes go after the last elicit");
    expect(doc).toContain("requires a Swoole instance");
  });

  it("marks type: resource tool references as legacy", () => {
    expect(read("mcp-servers.md")).toContain("(legacy)");
    expect(read("resources.md")).toContain("**Legacy:**");
  });

  it("documents the prompt and resource Meta API routes", () => {
    const prompt = handleMetaApiDocs({ topic: "prompt" });
    for (const name of ["listPrompts", "getPrompt", "createPrompt", "updatePrompt", "deletePrompt", "debugPrompt"])
      expect(prompt).toContain(name);
    const resource = handleMetaApiDocs({ topic: "resource" });
    for (const name of ["listResources", "getResource", "createResource", "updateResource", "deleteResource", "debugResource"])
      expect(resource).toContain(name);
    expect(handleMetaApiDocs({ topic: "tool" })).toContain("debugTool");
  });
});

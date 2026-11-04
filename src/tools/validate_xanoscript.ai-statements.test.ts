/**
 * Docs and grammar tests for the Xano AI function-stack statements (DEV-9270):
 * ai.text.generate, ai.image.generate, ai.video.generate, ai.speech.generate,
 * ai.speech.transcribe, ai.embedding.create, ai.rerank and ai.music.generate.
 *
 * These lock in:
 *   1. Every complete example in ai.md parses, and the examples cover all eight statements.
 *   2. An unknown key (`api_key`: the statements bill Xano AI credits only) fails.
 *   3. A missing required key fails.
 *   4. The `ai` topic is wired into the index, aliases and operations.
 *   5. `save_to_files` (DEV-9419) parses on the four media statements and is refused elsewhere.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
import { resolveTopic } from "../xanoscript.js";
import docsIndex from "../xanoscript_docs/docs_index.json" with { type: "json" };

// TODO(DEV-9419): the bundled parser comes from @xano/xanoscript-language-server, which
// learns `save_to_files` on the four media statements in 12.27.0
// (xano-labs/xanoscript-language-server#74, not yet published). Until package.json depends
// on that version, the tests that parse `save_to_files` (and the ai.md examples that use it)
// are skipped. After the bump, delete this flag and the skipIf calls.
// To run them early against a local language-server checkout: XS_AI_SAVE_TO_FILES=1 npx vitest run
const SAVE_TO_FILES = process.env.XS_AI_SAVE_TO_FILES === "1";

const MEDIA_STATEMENTS = ["ai.image.generate", "ai.video.generate", "ai.speech.generate", "ai.music.generate"];

const STATEMENTS = [
  "ai.text.generate",
  "ai.image.generate",
  "ai.video.generate",
  "ai.speech.generate",
  "ai.speech.transcribe",
  "ai.embedding.create",
  "ai.rerank",
  "ai.music.generate",
];

const read = (file: string) =>
  readFileSync(new URL(`../xanoscript_docs/${file}`, import.meta.url), "utf8");

const examples = [...read("ai.md").matchAll(/```xs\n([\s\S]*?)```/g)]
  .map(match => match[1])
  .filter(code => /^function\s+"[^"<]+"\s*\{/.test(code));

/** Wrap a stack body in a minimal function so the parser has full context. */
const inFunction = (stackBody: string): string => `function "qa_ai_check" {
  input {
  }
  stack {
${stackBody}
  }
  response = null
}`;

const check = (stackBody: string) => validateXanoscript({ code: inFunction(stackBody) });

describe("ai.md examples", () => {
  it("has a complete example for every statement", () => {
    const all = examples.join("\n");
    for (const statement of STATEMENTS) expect(all, statement).toContain(`${statement} {`);
    expect(all).toContain("storage.create_image");
    expect(all).toContain('response_format = "json"');
  });

  for (const [index, code] of examples.entries()) {
    it.skipIf(!SAVE_TO_FILES && code.includes("save_to_files"))(`validates ai.md example ${index + 1}`, () => {
      const result = validateXanoscript({ code });
      expect(result.valid, result.message).toBe(true);
    });
  }

  it("validates the working.md cheat-sheet snippet", () => {
    const working = read("working.md");
    const start = working.indexOf("## AI Statements (Xano AI)");
    const block = [...working.slice(start).matchAll(/```xs\n([\s\S]*?)```/g)][0][1];
    const result = check(block);
    expect(result.valid, result.message).toBe(true);
  });
});

describe("ai.* grammar", () => {
  it("accepts every optional key on ai.text.generate", () => {
    const result = check(`    ai.text.generate {
      description = "Answer a question"
      disabled = false
      model = "gemini-3.8-flash"
      prompt = "Hi"
      system = "Be brief"
      messages = []
      files = []
      temperature = 0.2
      max_tokens = 200
      response_format = "json"
      json_schema = {type: "object"}
    } as $result`);
    expect(result.valid, result.message).toBe(true);
  });

  it("accepts the minimal form of each statement", () => {
    const minimal: Record<string, string> = {
      "ai.text.generate": `model = "gemini-3.8-flash"\n      prompt = "Hi"`,
      "ai.image.generate": `model = "gemini-3.1-flash-image"\n      prompt = "A fox"`,
      "ai.video.generate": `model = "veo-3.1-fast-generate-001"\n      prompt = "A fox running"`,
      "ai.speech.generate": `model = "gemini-3.8-flash-tts"\n      text = "Hello"`,
      "ai.speech.transcribe": `model = "gemini-3.5-transcribe"\n      audio = $input.recording`,
      "ai.embedding.create": `model = "gemini-embedding-2"\n      input = "Hello"`,
      "ai.rerank": `model = "semantic-ranker-default-005"\n      query = "fox"\n      documents = ["a fox", "a dog"]`,
      "ai.music.generate": `model = "lyria-002"\n      prompt = "Calm piano"`,
    };
    for (const statement of STATEMENTS) {
      const result = check(`    ${statement} {\n      ${minimal[statement]}\n    } as $result`);
      expect(result.valid, `${statement}: ${result.message}`).toBe(true);
    }
  });

  it("refuses an api_key (Xano AI credits only)", () => {
    const result = check(`    ai.text.generate {
      model = "gemini-3.8-flash"
      prompt = "Hi"
      api_key = $env.OPENAI_KEY
    } as $result`);
    expect(result.valid).toBe(false);
  });

  it("refuses an unknown key on ai.rerank", () => {
    const result = check(`    ai.rerank {
      model = "semantic-ranker-default-005"
      query = "fox"
      documents = ["a fox"]
      provider = "cohere"
    } as $ranked`);
    expect(result.valid).toBe(false);
  });

  it("refuses ai.image.generate without a prompt", () => {
    const result = check(`    ai.image.generate {
      model = "gemini-3.1-flash-image"
      aspect_ratio = "16:9"
    } as $image`);
    expect(result.valid).toBe(false);
  });

  it("refuses ai.speech.transcribe without audio", () => {
    const result = check(`    ai.speech.transcribe {
      model = "gemini-3.5-transcribe"
      language = "en-US"
    } as $transcript`);
    expect(result.valid).toBe(false);
  });
});

describe.skipIf(!SAVE_TO_FILES)("save_to_files grammar", () => {
  const minimal: Record<string, string> = {
    "ai.image.generate": `model = "gemini-3.1-flash-image"\n      prompt = "A fox"`,
    "ai.video.generate": `model = "veo-3.1-fast-generate-001"\n      prompt = "A fox running"`,
    "ai.speech.generate": `model = "gemini-3.8-flash-tts"\n      text = "Hello"`,
    "ai.music.generate": `model = "lyria-002"\n      prompt = "Calm piano"`,
  };

  for (const statement of MEDIA_STATEMENTS) {
    it(`accepts save_to_files on ${statement}`, () => {
      for (const value of [`""`, `"public"`, `"private"`]) {
        const result = check(`    ${statement} {\n      ${minimal[statement]}\n      save_to_files = ${value}\n    } as $result`);
        expect(result.valid, `${statement} = ${value}: ${result.message}`).toBe(true);
      }
    });
  }

  it("refuses save_to_files on ai.text.generate", () => {
    const result = check(`    ai.text.generate {
      model = "gemini-3.8-flash"
      prompt = "Hi"
      save_to_files = "public"
    } as $result`);
    expect(result.valid).toBe(false);
  });
});

describe("save_to_files docs", () => {
  const doc = read("ai.md");

  it("has an ai.md example of each way to store media", () => {
    const all = examples.join("\n");
    expect(all).toContain(`save_to_files = "public"`);
    expect(all).toContain("image: $fox.image");
    expect(doc).not.toContain("saved_file");
    for (const from of ["storage.create_image {", "storage.create_video {", "storage.create_audio {"]) expect(all, from).toContain(from);
  });

  it("documents the values, the From File equivalence and the file-column mistake", () => {
    expect(doc).toContain("| `\"\"` (default) | off");
    for (const statement of MEDIA_STATEMENTS) expect(doc, statement).toMatch(new RegExp(`\\| \`${statement.replace(/\./g, "\\.")}\` \\| \`storage\\.create_(image|video|audio)\``));
    expect(doc).toContain("Putting `$result.image` / `$result.audio` / `$result.video` straight into a file column");
    expect(read("essentials.md")).toContain("the key then holds the stored file");
    expect(read("essentials.md")).not.toContain("saved_file");
    expect(read("working.md")).not.toContain("saved_file");
    expect(doc).toContain("response = $speech");
  });

  it("lists the new models and the Lyria 3 limits", () => {
    for (const model of ["gemini-nano-banana-2.1", "lyria-3-clip-preview", "lyria-3-pro-preview"]) expect(doc, model).toContain(`\`${model}\``);
    expect(doc).toContain("**`lyria-002` only**");
    expect(doc).toContain("{audio, lyrics, description, model}");
  });
});

describe("ai topic wiring", () => {
  it("serves the ai topic directly and through aliases", () => {
    for (const topic of ["ai", "xano-ai", "embeddings", "rerank", "transcribe"]) {
      expect(resolveTopic(topic)).toBe("ai");
      expect(xanoscriptDocs({ topic }).documentation).toContain("# AI Statements (Xano AI)");
    }
    expect(resolveTopic("agent")).toBe("agents");
  });

  it("maps every statement in the operations index to ai.md", () => {
    const operations = docsIndex.operations as Record<string, { file: string }>;
    for (const statement of STATEMENTS) expect(operations[statement]?.file, statement).toBe("ai.md");
    expect(operations["ai.agent.run"]?.file).toBe("agents.md");
  });

  it("documents the credits-only rule, the decision tree and the models", () => {
    const doc = read("ai.md");
    expect(doc).toContain("credits_exhausted");
    expect(doc).toContain("no** `api_key`");
    expect(doc).toContain("need a one-shot model call → `ai.*.generate`; need tools or multiple steps → `ai.agent.run`");
    for (const model of ["gemini-3.8-flash", "gemini-3.1-flash-image", "veo-3.1-fast-generate-001", "gemini-3.8-flash-tts", "gemini-3.5-transcribe", "gemini-embedding-2", "semantic-ranker-default-005", "lyria-002"])
      expect(doc, model).toContain(`\`${model}\``);
  });
});

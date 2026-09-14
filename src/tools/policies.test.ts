import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateXanoscript } from "./validate_xanoscript.js";
import { handleMetaApiDocs, metaApiDocsToolSpec } from "../meta_api_docs/index.js";
import { policyExample } from "../meta_api_docs/topics/policy.js";
import { getDocsForFilePath, resolveTopic } from "../xanoscript.js";
import { handleCliDocs, cliDocsToolSpec } from "../cli_docs/index.js";

describe("policy developer tools", () => {
  it("exposes native policy authoring through the discoverable docs tool", () => {
    expect(metaApiDocsToolSpec.inputParser.parse({ topic: "policy" }).topic).toBe("policy");
    const doc = handleMetaApiDocs({ topic: "policy" });
    expect(doc).toContain("/policy/parse");
    expect(doc).toContain("workspace:policy");
    expect(doc).toContain("source");
    expect(resolveTopic("policy")).toBe("policies");
    expect(getDocsForFilePath("policies/AUTH-EXAMPLE.xs")).toContain("policies");
    expect(cliDocsToolSpec.inputParser.parse({ topic: "policy" }).topic).toBe("policy");
    const cli = handleCliDocs({ topic: "policy" });
    expect(cli).toContain("xano policy parse --file");
    expect(cli).toContain("workspace push");
  });

  for (const prefix of ["", "\ufeff\n// Example policy\n\n/* authoring note */\n"]) {
    it(`does not falsely validate a policy locally (prefix length ${prefix.length})`, () => {
      const result = validateXanoscript({ code: prefix + policyExample });
      expect(result.valid).toBe(false);
      expect(result.message).toContain("xano_parse_policy");
      expect(result.message).toContain("native platform parser");
    });
  }

  it("preserves ordinary validation for objects containing policy text", () => {
    const result = validateXanoscript({ code: 'task policy_reminder {\n  stack {\n    var $note { value = "policy review" }\n  }\n}' });
    expect(result.valid).toBe(true);
  });

  it("reports native validation needed for policy files in a mixed directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "xano-policy-validation-"));
    try {
      writeFileSync(join(dir, "policy.xs"), policyExample);
      writeFileSync(join(dir, "task.xs"), "task smoke {\n  stack {\n    var $note { value = 1 }\n  }\n}");
      const result = validateXanoscript({ directory: dir });
      expect(result.valid).toBe(false);
      expect("total_files" in result && result.total_files).toBe(2);
      expect("valid_files" in result && result.valid_files).toBe(1);
      expect("results" in result && result.results.find(r => r.file_path?.endsWith("policy.xs"))?.message).toContain("native platform parser");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

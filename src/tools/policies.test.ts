import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateXanoscript } from "./validate_xanoscript.js";
import { handleMetaApiDocs, metaApiDocsToolSpec } from "../meta_api_docs/index.js";
import { policyExample } from "../meta_api_docs/topics/policy.js";
import { getDocsForFilePath, resolveTopic } from "../xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
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

    // Versioning is the platform's, not a policy one-off, and a no-op save is visible in one response.
    const policies = xanoscriptDocs({ topic: "policies" }).documentation;
    for (const text of [doc, cli, policies]) {
      expect(text).toContain("unchanged: true");
      expect(text).toMatch(/no version routes|no CLI command for it|Metadata API has no version routes/);
    }

    expect(doc).toContain("last_updated_at");
    expect(cli).toContain("-m \"Tightened the scope\"");
    // A policy file carries no comments, and no snippet may contradict that.
    for (const text of [doc, cli, policies]) {
      expect(text).toMatch(/carries no comments|Never write comments into policy source/i);
      // The message the platform actually gives, not the two it retired.
      expect(text).toContain('policy files cannot contain "//" comments');
      expect(text).not.toContain("Invalid block: description");
      expect(text).not.toContain("Invalid kind for severity");
    }
    expect(policyExample).not.toContain("//");
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

  it("does not treat a first token that merely starts with policy as a policy document", () => {
    const result = validateXanoscript({ code: "policy_x foo {\n}" });
    expect(result.message).not.toContain("native platform parser");
  });

  it("counts policy files in a mixed directory as skipped, not as errors", () => {
    const dir = mkdtempSync(join(tmpdir(), "xano-policy-validation-"));
    try {
      writeFileSync(join(dir, "policy.xs"), policyExample);
      writeFileSync(join(dir, "task.xs"), "task smoke {\n  stack {\n    var $note { value = 1 }\n  }\n}");
      const result = validateXanoscript({ directory: dir });
      // A policy document is not a broken file, so a clean tree does not report a failure.
      expect(result.valid).toBe(true);
      expect("total_files" in result && result.total_files).toBe(2);
      expect("valid_files" in result && result.valid_files).toBe(1);
      expect("invalid_files" in result && result.invalid_files).toBe(0);
      expect("skipped_files" in result && result.skipped_files).toBe(1);
      expect(result.message).toContain("1 valid, 1 skipped (policy — validate natively), 0 invalid");
      expect(result.message).not.toContain("❌ Files with errors:");
      expect(result.message).toContain("⏭ Policy documents — not validated locally:");
      // The refusal is still there, and now it says which file it is about.
      expect(result.message).toContain(join(dir, "policy.xs"));
      expect(result.message).toContain("native platform parser");
      expect("results" in result && result.results.find(r => r.file_path?.endsWith("policy.xs"))?.message).toContain("native platform parser");
      expect("results" in result && result.results.find(r => r.file_path?.endsWith("policy.xs"))?.policy).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("names the file on every error line of a mixed tree, and still fails on a real error", () => {
    const dir = mkdtempSync(join(tmpdir(), "xano-policy-validation-mixed-"));
    try {
      writeFileSync(join(dir, "policy.xs"), policyExample);
      writeFileSync(join(dir, "good.xs"), "task smoke {\n  stack {\n    var $note { value = 1 }\n  }\n}");
      writeFileSync(join(dir, "broken.xs"), "task broken {\n  stack {\n    var $x { value = \n  }\n");
      const result = validateXanoscript({ directory: dir });
      expect(result.valid).toBe(false);
      expect("valid_files" in result && result.valid_files).toBe(1);
      expect("invalid_files" in result && result.invalid_files).toBe(1);
      expect("skipped_files" in result && result.skipped_files).toBe(1);
      expect(result.message).toContain("1 valid, 1 skipped (policy — validate natively), 1 invalid");
      // Every line under the error heading carries a path, and only the real error is there.
      const errors = result.message.split("❌ Files with errors:")[1].split("⏭")[0];
      expect(errors).toContain(join(dir, "broken.xs"));
      expect(errors).not.toContain(join(dir, "policy.xs"));
      expect(errors).not.toContain("native platform parser");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("names a missing file in file_paths batch mode", () => {
    const result = validateXanoscript({ file_paths: ["/nowhere/at/all/missing.xs"] });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("/nowhere/at/all/missing.xs");
  });
});

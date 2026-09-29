import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateXanoscript, startsWithPolicyHeader } from "./validate_xanoscript.js";
import { policyExample } from "../meta_api_docs/topics/policy.js";

const TASK = "task smoke {\n  stack {\n    var $note { value = 1 }\n  }\n}";

function tree(files: Record<string, string>, run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "xano-policy-validation-"));
  try {
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("validate_xanoscript and policy documents", () => {
  for (const prefix of ["", "﻿\n// Example policy\n\n/* authoring note */\n"]) {
    it(`never reports a policy as valid, and points at the native parser (prefix length ${prefix.length})`, () => {
      const result = validateXanoscript({ code: prefix + policyExample });
      expect(result.valid).toBe(false);
      expect(result.message).toContain("xano_parse_policy");
      expect(result.message).toContain("native platform parser");
    });
  }

  it("validates an ordinary object that merely mentions a policy", () => {
    expect(validateXanoscript({ code: 'task policy_reminder {\n  stack {\n    var $note { value = "policy review" }\n  }\n}' }).valid).toBe(true);
    expect(validateXanoscript({ code: "policy_x foo {\n}" }).message).not.toContain("native platform parser");
  });

  it("counts policy files in a directory as skipped, not as errors", () => {
    tree({ "AUTH-001.xs": policyExample, "task.xs": TASK }, (dir) => {
      const result = validateXanoscript({ directory: dir });
      expect(result).toMatchObject({ valid: true, total_files: 2, valid_files: 1, invalid_files: 0, skipped_files: 1 });
      expect(result.message).toContain("1 valid, 1 skipped (policy — validate natively), 0 invalid");
      expect(result.message).not.toContain("❌ Files with errors:");
      // The skipped section names the file and says what validates it instead.
      const skipped = result.message.split("⏭ Policy documents — not validated locally:")[1];
      expect(skipped).toContain(join(dir, "AUTH-001.xs"));
      expect(skipped).toContain("native platform parser");
    });
  });

  it("still fails a batch on a real error, which the policy never joins", () => {
    tree({ "AUTH-001.xs": policyExample, "good.xs": TASK, "broken.xs": "task broken {\n  stack {\n    var $x { value = \n  }\n" }, (dir) => {
      const result = validateXanoscript({ directory: dir });
      expect(result).toMatchObject({ valid: false, valid_files: 1, invalid_files: 1, skipped_files: 1 });
      const errors = result.message.split("❌ Files with errors:")[1].split("⏭")[0];
      expect(errors).toContain("broken.xs");
      expect(errors).not.toContain("AUTH-001.xs");
      expect(errors).not.toContain("native platform parser");
    });
  });
});

describe("startsWithPolicyHeader", () => {
  it("finds the header after whitespace and comments, and nowhere else", () => {
    expect(startsWithPolicyHeader(policyExample)).toBe(true);
    expect(startsWithPolicyHeader("\uFEFF\n// Example policy\n\n/* authoring note */\n" + policyExample)).toBe(true);
    expect(startsWithPolicyHeader("// note\r\n/*\n  block\n*/policy \"K\" {}")).toBe(true);
    expect(startsWithPolicyHeader("policy")).toBe(true);
    expect(startsWithPolicyHeader('task policy_reminder {\n  stack {\n    var $note { value = "policy review" }\n  }\n}')).toBe(false);
    expect(startsWithPolicyHeader("policy_x foo {\n}")).toBe(false);
    expect(startsWithPolicyHeader("policy/* note */ \"K\" {}")).toBe(false);
    expect(startsWithPolicyHeader("// policy \"K\" {}")).toBe(false);
    expect(startsWithPolicyHeader("")).toBe(false);
  });

  it("ends a line comment at a line feed only, as the pattern it replaces did", () => {
    expect(startsWithPolicyHeader("// note\npolicy \"K\" {}")).toBe(true);
    expect(startsWithPolicyHeader("// note\rpolicy \"K\" {}")).toBe(false);
    expect(startsWithPolicyHeader("// /* not a block comment\npolicy \"K\" {}")).toBe(true);
  });

  it("ends a block comment at its first close, and reads an unterminated one as no header", () => {
    expect(startsWithPolicyHeader("/* // not a line comment */policy \"K\" {}")).toBe(true);
    // The opener's star does not close it: "/*/" is still open.
    expect(startsWithPolicyHeader("/*/ */policy \"K\" {}")).toBe(true);
    expect(startsWithPolicyHeader("/*/policy \"K\" {}")).toBe(false);
    expect(startsWithPolicyHeader("/* note */ x */ policy \"K\" {}")).toBe(false);
    expect(startsWithPolicyHeader("/* never closed\npolicy \"K\" {}")).toBe(false);
    expect(startsWithPolicyHeader("/* note */\n/* never closed policy \"K\" {}")).toBe(false);
  });

  it("stays linear on long runs of comments", () => {
    const started = performance.now();
    expect(startsWithPolicyHeader("/**/".repeat(100_000))).toBe(false);
    expect(startsWithPolicyHeader("/**/".repeat(100_000) + "policy \"K\" {}")).toBe(true);
    expect(startsWithPolicyHeader("/*" + "/**/".repeat(100_000))).toBe(false);
    expect(startsWithPolicyHeader("/*" + "*//*".repeat(100_000))).toBe(false);
    expect(startsWithPolicyHeader("//" + "*///".repeat(100_000))).toBe(false);
    // The pattern this replaces ran for more than five minutes on 500 repetitions of "/**/".
    expect(performance.now() - started).toBeLessThan(1000);
  });
});

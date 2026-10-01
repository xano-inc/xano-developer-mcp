import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateXanoscript, validateXanoscriptTool, SEVERITY, type ValidationResult } from "./validate_xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
import { policyExample } from "../meta_api_docs/topics/policy.js";

const TASK = "task smoke {\n  stack {\n    var $note { value = 1 }\n  }\n}";

/** policyExample with `line` inserted before its severity line (line 4). */
const beforeSeverity = (line: string) => policyExample.replace('  severity = "high"', `${line}\n  severity = "high"`);

function validate(code: string): ValidationResult {
  return validateXanoscript({ code }) as ValidationResult;
}

/** The diagnostics of one severity as [message, line, column], line and column counted from 1. */
function located(result: ValidationResult, severity: number): Array<[string, number, number]> {
  return result.errors
    .filter((d) => d.severity === severity)
    .map((d) => [d.message.split("\n")[0], d.range.start.line + 1, d.range.start.character + 1]);
}

function tree(files: Record<string, string>, run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "xano-policy-validation-"));
  try {
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("validate_xanoscript and valid policy documents", () => {
  it("passes the canonical example with no diagnostics", () => {
    const result = validate(policyExample);
    expect(result.valid, result.message).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("passes every policy in the policies topic", () => {
    const blocks = [...xanoscriptDocs({ topic: "policies" }).documentation.matchAll(/```xs\n([\s\S]*?)```/g)]
      .map((match) => match[1])
      .filter((block) => block.startsWith("policy "));
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const result = validate(block);
      expect(result.valid, result.message).toBe(true);
      expect(result.errors).toEqual([]);
    }
  });

  it("passes the other fields a policy may set, a bare key, several rules and an inactive policy without rules", () => {
    const full = `policy DB-001 {
  title = "No direct writes"
  statement = "Endpoints do not write to tables directly."
  rationale = "Writes go through functions."
  narrative = """
Writes go through functions,
so they are audited in one place.
"""
  tags = ["soc2", "hipaa"]
  severity = "critical"
  active = true
  enforcement = "mandatory"

  rule {
    title = "No writes"
    check = "stack.statement_forbidden"
    params = {
      statements : ["db.add", "db.edit"]
      except_tags: ["generated"]
    }
  }

  rule {
    check = "object.auth_required"
  }
}`;
    const parked = `policy "PARKED-1" {\n  title = "Parked"\n  statement = "Not evaluated yet."\n  active = false\n  enforcement = "advisory"\n}`;
    for (const code of [full, parked]) {
      const result = validate(code);
      expect(result.valid, result.message).toBe(true);
      expect(result.errors).toEqual([]);
    }
  });

  it("still validates an ordinary object that merely mentions a policy", () => {
    const result = validate('task policy_reminder {\n  stack {\n    var $note { value = "policy review" }\n  }\n}');
    expect(result.valid, result.message).toBe(true);
  });
});

describe("validate_xanoscript and invalid policy documents", () => {
  const cases: Array<[string, string, string, number, number]> = [
    ["a comment on its own line", beforeSeverity("  // note"), 'line 4: policy files cannot contain "//" comments. Put the explanation in the policy\'s statement, rationale or narrative.', 4, 3],
    ["a comment after a value", policyExample.replace('severity = "high"', 'severity = "high" // critical | high'), 'line 4: policy files cannot contain "//" comments. Put the explanation in the policy\'s statement, rationale or narrative.', 4, 21],
    ["a block comment", beforeSeverity("  /* note */"), 'line 4: policy files cannot contain "/* */" comments. Put the explanation in the policy\'s statement, rationale or narrative.', 4, 3],
    ["a # character", beforeSeverity("  # note"), "Syntax error: unexpected '#'", 4, 3],
    ["a field set twice", beforeSeverity('  severity = "low"'), 'policy: "severity" is set more than once.', 5, 3],
    ["two fields on one line", policyExample.replace('  severity = "high"\n  active = true', '  severity = "high" active = true'), "Policy fields must be separated by a newline.", 4, 21],
    ["a named rule", policyExample.replace("rule {", 'rule "R1" {'), 'rule[0]: A rule cannot be named. Write "rule {" — rules are identified by position (KEY.R1, KEY.R2…).', 8, 8],
    ["a parameter that is not a literal", policyExample.replace('["public", "xano:quick-start"]', "$env.public_tags"), "Policy parameters must be literal values.", 10, 28],
  ];

  for (const [name, code, message, line, column] of cases) {
    it(`fails ${name} with the language server's error, line and column`, () => {
      const result = validate(code);
      expect(result.valid).toBe(false);
      expect(located(result, SEVERITY.ERROR)).toEqual([[message, line, column]]);
      expect(result.message).toContain(`[ERROR] [Line ${line}, Column ${column}] ${message}`);
    });
  }

  it("fails an unclosed policy", () => {
    const result = validate(policyExample.slice(0, -1));
    expect(result.valid).toBe(false);
    expect(located(result, SEVERITY.ERROR).map(([message]) => message)).toEqual(["Expecting --> } <-- but found --> '' <--"]);
  });
});

describe("validate_xanoscript and the bundled check catalogue", () => {
  // The snapshot's date changes whenever the language server regenerates it.
  const note = /\(checked against the language server's check catalogue of \d{4}-\d{2}-\d{2}; your instance decides on save\)$/;
  const cases: Array<[string, string, string, number, number]> = [
    ["an unknown check", policyExample.replace('"object.auth_required"', '"object.auth_requird"'), '"object.auth_requird" is not a policy check. Did you mean "object.auth_required"?', 9, 13],
    ["an unknown param", policyExample.replace("except_tags", "except_tagz"), 'unknown param "except_tagz" for check "object.auth_required". Did you mean "except_tags"?', 10, 15],
    ["a severity outside its set", policyExample.replace('severity = "high"', 'severity = "urgent"'), 'severity must be one of: critical, high, medium, low (got "urgent").', 4, 14],
    ["a removed field", beforeSeverity('  owner = "security"'), 'policy: "owner" was removed; delete the line. Ownership will return as a reference to a workspace member.', 4, 3],
    ["a reserved block", policyExample.replace("  rule {", "  guard {\n  }\n\n  rule {"), 'Policy block "guard" is reserved. Policies support rule blocks only.', 8, 3],
    ["an active policy with no rule", `policy "P-1" {\n  title = "t"\n  statement = "s"\n  active = true\n  enforcement = "advisory"\n}`, "An active policy needs at least one rule; set active = false instead.", 1, 8],
  ];

  for (const [name, code, message, line, column] of cases) {
    it(`warns about ${name} at its line and column, and leaves the verdict to the instance`, () => {
      const result = validate(code);
      expect(result.valid, result.message).toBe(true);
      expect(located(result, SEVERITY.ERROR)).toEqual([]);
      const warnings = located(result, SEVERITY.WARNING);
      expect(warnings).toHaveLength(1);
      expect(warnings[0][0]).toContain(message);
      expect(warnings[0][0]).toMatch(note);
      expect(warnings[0].slice(1)).toEqual([line, column]);
      expect(result.message).toContain(`[WARNING] [Line ${line}, Column ${column}] ${message}`);
      expect(validateXanoscriptTool({ code }).structuredContent).toMatchObject({ valid: true, warnings: 1 });
    });
  }
});

describe("validate_xanoscript and policy files in a batch", () => {
  it("counts a valid policy file as valid", () => {
    tree({ "AUTH-001.xs": policyExample, "task.xs": TASK }, (dir) => {
      const result = validateXanoscript({ directory: dir });
      expect(result).toMatchObject({ valid: true, total_files: 2, valid_files: 2, invalid_files: 0 });
      expect(result.message).toContain("Validated 2 file(s): 2 valid, 0 invalid");
      expect(result.message.split("✅ Valid files:")[1]).toContain(join(dir, "AUTH-001.xs"));
    });
  });

  it("fails a batch on a broken policy file, and names it with its error", () => {
    tree({ "AUTH-001.xs": beforeSeverity("  // note"), "task.xs": TASK }, (dir) => {
      const result = validateXanoscript({ directory: dir });
      expect(result).toMatchObject({ valid: false, total_files: 2, valid_files: 1, invalid_files: 1 });
      const errors = result.message.split("❌ Files with errors:")[1].split("✅ Valid files:")[0];
      expect(errors).toContain("✗ AUTH-001.xs: Found 1 error(s):");
      expect(errors).toContain('[ERROR] [Line 4, Column 3] line 4: policy files cannot contain "//" comments.');
      expect(errors).not.toContain("task.xs");
    });
  });
});

/**
 * QA regression tests for DEV-7447 — "MCP uses incorrect db.delete syntax".
 *
 * XanoScript has no `db.delete`, no `db.delete_all`, and no fluent
 * `db.<table>.query()...delete()` chain. The valid delete operations are:
 *   - db.del          → delete a single record by field/value
 *   - db.bulk.delete  → delete many records matching a `where` condition
 *   - db.truncate     → delete every record in a table
 *
 * These tests lock in three things:
 *   1. The valid delete forms parse against the language server.
 *   2. The invalid forms fail AND surface a targeted fix suggestion.
 *   3. The shipped Metadata-API doc examples never regress to bad syntax
 *      (and still parse), extracted verbatim from the exported topic docs.
 */

import { describe, it, expect } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";
import { topics } from "../meta_api_docs/index.js";

/** Wrap a stack body in a minimal, valid `task` so the parser has full context. */
const inTask = (stackBody: string): string =>
  `task qa_delete_check {\n  stack {\n${stackBody}\n  }\n}`;

/** Recursively collect every XanoScript source string reachable from a doc node. */
function collectXanoscripts(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    // Some examples embed the payload as a JSON blob containing "xanoscript".
    if (node.includes('"xanoscript"')) {
      const match = node.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (typeof parsed?.xanoscript === "string") out.push(parsed.xanoscript);
        } catch {
          /* not valid JSON — ignore */
        }
      }
    }
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectXanoscripts(item, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "xanoscript" && typeof value === "string") {
        out.push(value);
      } else {
        collectXanoscripts(value, out);
      }
    }
  }
  return out;
}

/** Every XanoScript example string across all Metadata-API topic docs. */
function allDocExamples(): string[] {
  return collectXanoscripts(topics);
}

/** Patterns that must never appear in any shipped example. */
const BANNED_DELETE_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: "db.delete", re: /\bdb\.delete\b(?!_)/ },
  { label: "db.delete_all", re: /\bdb\.delete_all\b/ },
  { label: "fluent .delete()", re: /\.delete\s*\(/ },
];

describe("DEV-7447 delete syntax — valid operations parse", () => {
  it("db.del (single record) is valid", () => {
    const result = validateXanoscript({
      code: inTask(
        `    db.del "session" {\n      field_name = "id"\n      field_value = $input.id\n    }`
      ),
    });
    expect(result.valid).toBe(true);
  });

  it("db.bulk.delete (many by condition) is valid", () => {
    const result = validateXanoscript({
      code: inTask(
        `    db.bulk.delete "session" {\n      where = $db.session.expires_at < now\n    } as $deleted_count`
      ),
    });
    expect(result.valid).toBe(true);
  });

  it("db.truncate (whole table) is valid", () => {
    const result = validateXanoscript({
      code: inTask(`    db.truncate "session" { reset = true }`),
    });
    expect(result.valid).toBe(true);
  });
});

describe("DEV-7447 delete syntax — invalid forms fail with a fix hint", () => {
  it("db.delete is rejected and suggests db.del / db.bulk.delete", () => {
    const result = validateXanoscript({
      code: inTask(
        `    db.delete "session" {\n      field_name = "id"\n      field_value = 1\n    }`
      ),
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("db.del");
    expect(result.message).toContain("db.bulk.delete");
  });

  it("db.delete_all is rejected and suggests db.bulk.delete / db.truncate", () => {
    const result = validateXanoscript({
      code: inTask(
        `    db.delete_all "session" {\n      where = $db.session.id > 0\n    }`
      ),
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("db.bulk.delete");
    expect(result.message).toContain("db.truncate");
  });

  it("fluent .query()...delete() chain is rejected with a suggestion", () => {
    const result = validateXanoscript({
      code: inTask(
        `    db.session.query().where("expires_at", "<", now).delete()`
      ),
    });
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/db\.del|db\.bulk\.delete/);
  });
});

describe("DEV-7447 delete syntax — shipped doc examples", () => {
  const examples = allDocExamples();

  it("finds XanoScript examples to check", () => {
    expect(examples.length).toBeGreaterThan(0);
  });

  it("no example uses a banned delete form", () => {
    const offenders: string[] = [];
    for (const example of examples) {
      for (const { label, re } of BANNED_DELETE_PATTERNS) {
        if (re.test(example)) offenders.push(`${label} in: ${example.slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every example that deletes records parses cleanly", () => {
    const deleteExamples = examples.filter((e) => /\bdb\.(del|bulk\.delete|truncate)\b/.test(e));
    expect(deleteExamples.length).toBeGreaterThan(0);
    for (const example of deleteExamples) {
      const result = validateXanoscript({ code: example });
      expect(result.valid, `should parse:\n${example}`).toBe(true);
    }
  });

  it("the cleanup_old_sessions task example is present and valid", () => {
    const cleanup = examples.filter((e) => e.includes("cleanup_old_sessions"));
    // Present in both the task topic and the workflows topic.
    expect(cleanup.length).toBeGreaterThanOrEqual(2);
    for (const example of cleanup) {
      expect(example).toContain("db.bulk.delete");
      const result = validateXanoscript({ code: example });
      expect(result.valid, `should parse:\n${example}`).toBe(true);
    }
  });
});

/**
 * Regression tests for the `db.increment` statement.
 *
 * `db.increment` atomically adds a signed number to one numeric field on every
 * row matching a `where`. These tests lock in:
 *   1. The valid forms parse (increment, decrement, return count, output, addon).
 *   2. Invalid forms fail (a wrong key such as `field =`, a missing `where`).
 *   3. Every `db.increment` example shipped in database.md parses.
 */

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { validateXanoscript } from "./validate_xanoscript.js";

/** Wrap a stack body in a minimal, valid `task` so the parser has full context. */
const inTask = (stackBody: string): string =>
  `task qa_increment_check {\n  stack {\n${stackBody}\n  }\n}`;

const valid = (stackBody: string) => validateXanoscript({ code: inTask(stackBody) });

describe("db.increment — valid forms parse", () => {
  it("increments a counter by 1", () => {
    const result = valid(`    db.increment "post" {
      where = $db.post.id == $input.id
      field_name = "view_count"
      value = 1
    } as $updated`);
    expect(result.valid, result.message).toBe(true);
  });

  it("decrements with a negative value, guarded by the where", () => {
    const result = valid(`    db.increment "product" {
      where = $db.product.id == $input.product_id && $db.product.stock >= 1
      field_name = "stock"
      value = -1
    } as $updated`);
    expect(result.valid, result.message).toBe(true);
  });

  it("accepts every optional key including return count", () => {
    const result = valid(`    db.increment "post" {
      description = "Bump the view counter"
      disabled = false
      where = $db.post.id == $input.id
      field_name = "view_count"
      value = 1
      return = {type: "count"}
    } as $count`);
    expect(result.valid, result.message).toBe(true);
  });

  it("accepts output and an addon on the list form", () => {
    const result = valid(`    db.increment "post" {
      where = $db.post.id == $input.id
      field_name = "view_count"
      value = 1
      return = {type: "list"}
      output = ["id", "view_count"]
      addon = [
        {
          name : "post_author"
          input: {post_id: $output.id}
          as   : "author"
        }
      ]
    } as $updated`);
    expect(result.valid, result.message).toBe(true);
  });
});

describe("db.increment — invalid forms fail", () => {
  it("rejects `field =` (the key is `field_name`)", () => {
    const result = valid(`    db.increment "post" {
      where = $db.post.id == $input.id
      field = "view_count"
      value = 1
    } as $updated`);
    expect(result.valid).toBe(false);
  });

  it("rejects a missing where", () => {
    const result = valid(`    db.increment "post" {
      field_name = "view_count"
      value = 1
    } as $updated`);
    expect(result.valid).toBe(false);
  });
});

/** Every ```xs block in a docs file that uses db.increment. */
function incrementExamples(file: string): string[] {
  const doc = readFileSync(new URL(`../xanoscript_docs/${file}`, import.meta.url), "utf8");
  return [...doc.matchAll(/```xs\n([\s\S]*?)```/g)]
    .map((match) => match[1].trim())
    .filter((code) => /\bdb\.increment\b/.test(code));
}

describe("db.increment — shipped doc examples", () => {
  const examples = incrementExamples("database.md");
  const digestExamples = [...incrementExamples("essentials.md"), ...incrementExamples("working.md")];

  it("database.md documents db.increment with several examples", () => {
    expect(examples.length).toBeGreaterThanOrEqual(4);
  });

  it("essentials.md and working.md carry a db.increment example", () => {
    expect(digestExamples.length).toBeGreaterThanOrEqual(2);
  });

  it("every db.increment example parses", () => {
    for (const code of [...examples, ...digestExamples]) {
      const indented = code
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n");
      const result = validateXanoscript({ code: inTask(indented) });
      expect(result.valid, `should parse:\n${code}\n\n${result.message}`).toBe(true);
    }
  });
});

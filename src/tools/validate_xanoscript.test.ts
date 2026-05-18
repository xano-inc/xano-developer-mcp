import { describe, expect, it } from "vitest";
import {
  enhanceErrorMessage,
  validateXanoscriptToolSpec,
} from "./validate_xanoscript.js";

describe("enhanceErrorMessage", () => {
  it("should suggest empty input blocks for missing input clauses", () => {
    const message = enhanceErrorMessage(
      "query is missing an input clause",
      'query "items" verb=GET {\n  stack {}\n  response = []\n}',
      0
    );

    expect(message).toContain("Add an input block");
    expect(message).toContain("input {}");
    expect(message).toContain("input, stack, and response");
  });

  it("should suggest complete constructs for missing response clauses", () => {
    const message = enhanceErrorMessage(
      "query is missing a response clause",
      'query "items" verb=GET {\n  input {}\n  stack {}\n}',
      0
    );

    expect(message).toContain("Add a response assignment");
    expect(message).toContain("input, stack, and response");
  });

  it("should suggest safe comment placement for parser errors caused by comments", () => {
    const message = enhanceErrorMessage(
      "Expecting --> ] <-- but found --> '// Index user_id for faster queries' <--",
      'index = [\n  // Index user_id for faster queries\n  {type: "btree", field: [{name: "user_id"}]}\n]',
      1
    );

    expect(message).toContain("Move comments out of arrays");
    expect(message).toContain("Safe positions");
    expect(message).toContain("immediately above stack operation lines");
  });

  it("should suggest assertion and mock placement for unit-test argument mistakes", () => {
    const mockMessage = enhanceErrorMessage(
      "The argument 'mock' is not valid in this context",
      'test "returns user" {\n  mock = {}\n}',
      1
    );
    const valueMessage = enhanceErrorMessage(
      "The argument 'value' is not valid in this context",
      "expect.to_be_true ($response.ok) { value = true }",
      0
    );

    expect(mockMessage).toContain("Put mock blocks on the stack operation");
    expect(valueMessage).toContain("No-property assertions do not take value");
  });

  it("should suggest persisted-result assignment for missing as warnings", () => {
    const message = enhanceErrorMessage(
      "`as <variable>` is missing",
      'db.query "user" { where = $db.user.active == true }',
      0
    );

    expect(message).toContain("as $variable");
  });

  it("should map unknown includes filters to expression and db-query alternatives", () => {
    const message = enhanceErrorMessage(
      "Unknown filter function 'includes'",
      'var $ok { value = $title|includes:"test" }',
      0
    );

    expect(message).toContain('|contains:"text"');
    expect(message).toContain('field includes "text"');
  });

  it("should suggest format_timestamp for timestamp-part expression filters", () => {
    const message = enhanceErrorMessage(
      "Unknown filter function 'timestamp_day_of_week'",
      "var $dow { value = $ts|timestamp_day_of_week }",
      0
    );

    expect(message).toContain("format_timestamp");
    expect(message).toContain('$ts|format_timestamp:"N":"UTC"');
  });

  it("should reject guessed async and run.job primitives", () => {
    const asyncMessage = enhanceErrorMessage(
      "The argument 'async' is not valid in this context",
      'function.run "send_notification" { async = true }',
      0
    );
    const runJobMessage = enhanceErrorMessage(
      "Expecting --> } <-- but found --> 'run' <--",
      'run.job "my_job" { stack {} }',
      0
    );

    expect(asyncMessage).toContain("Do not add async = true");
    expect(runJobMessage).toContain("Do not invent run.job");
  });

  it("should suggest canonical conditional blocks for JavaScript-style else", () => {
    const message = enhanceErrorMessage(
      "Expecting --> } <-- but found --> 'else' <--",
      "} else {",
      0
    );

    expect(message).toContain("conditional");
    expect(message).toContain("elseif");
  });
});

describe("validate_xanoscript tool spec", () => {
  it("should clarify that standalone validation does not prove later writes", () => {
    expect(validateXanoscriptToolSpec.description).toContain(
      "does not prove that a later write_file or replace_string_in_file call saved the same content"
    );
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { validateXanoscript } from "./validate_xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
import { handleMetaApiDocs } from "../meta_api_docs/index.js";
import { handleCliDocs } from "../cli_docs/index.js";
import { policyExample } from "../meta_api_docs/topics/policy.js";
import { getDocsForFilePath, resolveTopic } from "../xanoscript.js";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const policies = () => xanoscriptDocs({ topic: "policies" }).documentation;

describe("policy documentation", () => {
  it("distinguishes no_objects rule results from passing runs and preserves older-run compatibility", () => {
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }), handleCliDocs({ topic: "policy" })]) {
      expect(text).toContain("no_objects");
      expect(text).toContain("checked: 0");
      expect(text).toContain("unchecked rules");
      expect(text).not.toContain("there is no separate status for it");
    }
  });

  it("is served by all three documentation tools", () => {
    expect(resolveTopic("policy")).toBe("policies");
    expect(policies()).toContain("# Workspace policies");
    // The readme topic's tables are how an agent learns which topics exist.
    expect(xanoscriptDocs({ topic: "readme" }).documentation).toMatch(/^\| `policies` /m);
    expect(handleMetaApiDocs({ topic: "policy" })).toContain("/policy/parse");
    expect(handleCliDocs({ topic: "policy" })).toContain("xano policy parse");
    expect(handleCliDocs({ topic: "skills" })).toContain("xano skills pull");
  });

  it("gives a policy file the policy topic alone", () => {
    expect(getDocsForFilePath("policies/AUTH-001.xs")).toEqual(["policies"]);
    expect(getDocsForFilePath("api/users/create.xs")).toContain("syntax");
    expect(getDocsForFilePath("api/users/create.xs")).not.toContain("policies");
  });

  it("teaches no comment inside a policy, and the refusal the platform actually gives", () => {
    const blocks = [...policies().matchAll(/```xs\n([\s\S]*?)```/g)].map((match) => match[1]);
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of [...blocks, policyExample]) {
      expect(block).not.toContain("//");
      expect(block).not.toContain("/*");
    }
    expect(policies()).toContain('policy files cannot contain "//" comments');
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }), handleCliDocs({ topic: "policy" })]) {
      expect(text).not.toContain("Invalid block: description");
      expect(text).not.toContain("Invalid kind for severity");
    }
  });

  it("shows the same canonical example in the XanoScript and Metadata API topics", () => {
    expect(policyExample.split("\n")[0]).toBe('policy "AUTH-EXAMPLE" {');
    expect(policies()).toContain(policyExample);
  });

  it("carries the check catalogue exactly as the generator renders it from the committed catalogue", async () => {
    const generator = await import(new URL("../../scripts/gen-policy-check-docs.mjs", import.meta.url).href);
    const markdown = readFileSync(generator.POLICIES_MD, "utf8");
    const catalogue = JSON.parse(readFileSync(generator.CATALOGUE, "utf8"));
    expect(generator.splice(markdown, generator.renderSections(catalogue))).toBe(markdown);
  });

  it("publishes one xano-policies stub: the copy this repo's sessions load is identical", () => {
    expect(read("../../.claude/skills/xano-policies/SKILL.md")).toBe(read("../../skills/xano-policies/SKILL.md"));
  });

  it("keeps the stub to the rules that never change and a pointer at the live skill", () => {
    const stub = read("../../skills/xano-policies/SKILL.md");
    expect(stub).not.toContain("## Commands");
    expect(stub).toContain("xano skills pull");
    expect(stub).toContain("xano policy --help");
    expect(stub).toContain("as `policy_duplicate`, naming that policy");
  });

  it("says tenant, sandbox and release pushes carry policy files, and when they leave them out", () => {
    for (const text of [handleMetaApiDocs({ topic: "policy" }), handleCliDocs({ topic: "policy" })]) {
      expect(text).not.toMatch(/(push|a multidoc) carr(y|ies) no policies/);
      expect(text).toContain("carry policy files while");
      expect(text).toContain("remote tenant");
      expect(text).toContain("created before policies");
      expect(text).toContain("policies_skipped");
      // A release built from files carries them only for a policy author.
      expect(text).toContain("live-branch policies instead");
    }
  });

  it("says an uploaded release archive that carries policies needs a policy author", () => {
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }), handleCliDocs({ topic: "policy" })]) {
      expect(text).toMatch(/release[^.]*(archive|import)[^.]*carries policies/);
    }
    expect(handleCliDocs({ topic: "policy" })).toContain("nothing is stored");
  });

  it("names every route and command that overrides a set-live or publish gate, and the branch a refused set-live keeps", () => {
    const text = policies();
    expect(text).toContain("`import-schema` with `setlive`");
    expect(text).toContain("`payload.branch`");
    expect(text).toContain("`override_reason` on the Metadata API create and save routes");
    expect(text).toContain("`xano function create` and `xano function edit` take `--policy-override");
    const meta = handleMetaApiDocs({ topic: "policy" });
    expect(meta).toContain("import-schema with setlive");
    expect(meta).toContain("payload.branch {id, label}");
    expect(meta).toContain("the create and save routes of the gated objects");
    const cli = handleCliDocs({ topic: "policy" });
    expect(cli).toContain("function create and function edit exit 2");
    expect(cli).toContain("branch set_live exit 2");
    // Both function create and function edit list the flag.
    expect(handleCliDocs({ topic: "function" }).match(/policy-override/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("says agents, MCP servers (their prompt and resource lists included) and realtime channels are gated, and lists every kind the publish gate never sees", () => {
    expect(policies()).toContain("an agent, an MCP server or a realtime channel to the workspace's **live** branch only");
    expect(handleMetaApiDocs({ topic: "policy" })).toContain("agents, MCP servers and realtime channels: tables, API groups");
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" })]) {
      expect(text).not.toContain("Tables, API groups and environment variables are not draftable");
      expect(text).toMatch(/[Tt]ables, API groups, environment variables, workspace and branch settings, realtime servers, and MCP prompts and resources are saved without/);
      expect(text).toMatch(/changes the server, so that save is gated/);
      expect(text).not.toContain("A secret pasted into a live agent's settings");
    }
  });

  it("says a read-only session writes no policy and the tenant reads need tenant_center read", () => {
    const refusal = "This is a read-only session. Enable editing to modify this resource.";
    expect(policies()).toContain(refusal);
    const meta = handleMetaApiDocs({ topic: "policy" });
    expect(meta).toContain(refusal);
    expect(meta).toContain("tenant_center read");
    expect(meta).toContain("at most 200 ids");
  });

  it("documents the refusals for exact copies, remediation and reserved blocks", () => {
    const text = policies();
    expect(text).toContain("A policy with exactly these rules already exists: KEY. Change a parameter or scope to add another.");
    expect(text).toContain('policy: "remediation" was removed; put the guidance in the policy statement.');
    expect(text).toContain('Policy block "<name>" is reserved. Policies support rule blocks only.');
    expect(handleMetaApiDocs({ topic: "policy" })).toContain("policy_duplicate");
  });

  it("gives every capped plan and the retired param's replacement", () => {
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" })]) {
      expect(text).toContain("Free 3; Starter, Launch and Essential 10; Pro and above unlimited");
    }
    const database = xanoscriptDocs({ topic: "database" }).documentation;
    expect(database).toContain('param_names: ["output"]');
    expect(database).not.toContain('param: "output"');
  });

  it("lists the policies topic in both tier docs", () => {
    expect(xanoscriptDocs({ tier: "survival" }).documentation).toMatch(/^survival, working, .*, policies$/m);
    expect(xanoscriptDocs({ tier: "working" }).documentation).toMatch(/^\| `policies` \|/m);
  });

  it("describes where output is accepted the way the bundled language server does", () => {
    // database.md: the platform takes `output` on all six; the language server rejects the last two.
    const withOutput = (statement: string) => validateXanoscript({
      code: `function "t" {\n  input {\n  }\n  stack {\n    ${statement} "product" {\n${
        statement === "db.add" ? "" : "      field_name = \"id\"\n      field_value = 1\n"
      }      data = { name: "a" }\n      output = ["id"]\n    } as $row\n  }\n  response = $row\n}`,
    }).valid;
    expect(withOutput("db.add")).toBe(true);
    expect(withOutput("db.edit")).toBe(true);
    expect(withOutput("db.patch")).toBe(false);
    expect(withOutput("db.add_or_edit")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { validateXanoscript } from "./validate_xanoscript.js";
import { xanoscriptDocs } from "./xanoscript_docs.js";
import { handleMetaApiDocs } from "../meta_api_docs/index.js";
import { handleCliDocs } from "../cli_docs/index.js";
import { policyDoc, policyExample } from "../meta_api_docs/topics/policy.js";
import { getDocsForFilePath, resolveTopic } from "../xanoscript.js";

/** As a host that includes the policies feature serves it. */
const ON = { policies: true };

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const policies = () => xanoscriptDocs({ topic: "policies" }, ON).documentation;

describe("policy documentation", () => {
  it("distinguishes no_objects rule results from passing runs and preserves older-run compatibility", () => {
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }, ON), handleCliDocs({ topic: "policy" }, ON)]) {
      expect(text).toContain("no_objects");
      expect(text).toContain("checked: 0");
      expect(text).toContain("unchecked rules");
      expect(text).not.toContain("there is no separate status for it");
    }
  });

  it("is served by all three documentation tools", () => {
    expect(resolveTopic("policy", ON)).toBe("policies");
    expect(policies()).toContain("# Workspace policies");
    // The readme topic's tables are how an agent learns which topics exist.
    expect(xanoscriptDocs({ topic: "readme" }, ON).documentation).toMatch(/^\| `policies` /m);
    expect(handleMetaApiDocs({ topic: "policy" }, ON)).toContain("/policy/parse");
    expect(handleCliDocs({ topic: "policy" }, ON)).toContain("xano policy parse");
    expect(handleCliDocs({ topic: "skills" }, ON)).toContain("xano skills pull");
  });

  it("gives a policy file the policy topic alone", () => {
    expect(getDocsForFilePath("policies/AUTH-001.xs", ON)).toEqual(["policies"]);
    expect(getDocsForFilePath("api/users/create.xs", ON)).toContain("syntax");
    expect(getDocsForFilePath("api/users/create.xs", ON)).not.toContain("policies");
  });

  it("teaches no comment inside a policy, and the refusal the platform actually gives", () => {
    const blocks = [...policies().matchAll(/```xs\n([\s\S]*?)```/g)].map((match) => match[1]);
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of [...blocks, policyExample]) {
      expect(block).not.toContain("//");
      expect(block).not.toContain("/*");
    }
    expect(policies()).toContain('policy files cannot contain "//" comments');
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }, ON), handleCliDocs({ topic: "policy" }, ON)]) {
      expect(text).not.toContain("Invalid block: description");
      expect(text).not.toContain("Invalid kind for severity");
    }
  });

  it("shows the same canonical example in the XanoScript and Metadata API topics", () => {
    expect(policyExample.split("\n")[0]).toBe('policy "AUTH-EXAMPLE" {');
    expect(policies()).toContain(policyExample);
  });

  it("names the modes Off, Warn and Block, with warn the default and the old values refused by name", async () => {
    const catalogue = JSON.parse(read("../../scripts/policy-catalogue.json"));
    expect(catalogue.document.fields.enforcement.values).toEqual(["off", "warn", "block"]);
    expect(catalogue.document.fields.enforcement.default).toBe("warn");
    expect(catalogue.document.retired.values.enforcement).toEqual({ advisory: "warn", blocking: "block" });
    expect(catalogue.document.retired.values_message.enforcement).toBe('policy: enforcement "%1$s" was renamed to "%2$s"; write enforcement = "%2$s".');
    expect(catalogue.document.retired.policy.active).toBe('policy: "active" was replaced by "enforcement"; write enforcement = "off", enforcement = "warn" or enforcement = "block".');
    expect(policyExample).toContain('  enforcement = "warn"\n  template = "endpoints_need_login"\n');
    const refusal = 'policy: enforcement "advisory" was renamed to "warn"; write enforcement = "warn".';
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }, ON), handleCliDocs({ topic: "policy" }, ON)]) expect(text).toContain(refusal);
    expect(policies()).toContain("- **Warn:** reports problems and stops nothing.");
    expect(policies()).toContain("- **Block:** stops a publish, merge or set live that adds a new problem or changes an object that already has one, and a tenant deploy with any problem, unless someone allowed to override gives a reason");
    expect(read("../../skills/xano-policies/SKILL.md")).toContain('`enforcement` is `"off"`, `"warn"` or `"block"`');
    expect(read("../../skills/xano-policies/SKILL.md")).toBe(read("../../.claude/skills/xano-policies/SKILL.md"));
  });

  it("records the template a policy came from, and lets the platform name a create from it", async () => {
    const catalogue = JSON.parse(read("../../scripts/policy-catalogue.json"));
    expect(Object.keys(catalogue.document.fields)).toEqual(["title", "statement", "rationale", "narrative", "severity", "enforcement", "template", "tags"]);
    expect(policies()).toContain('`template` names the platform template the policy was created from, by its id (`template = "endpoints_need_login"`');
    expect(policies()).toContain("`policy_unknown_template`");
    expect(policies()).toContain("without a template and with no key, the lowest free `POL-001`, `POL-002`…, and the title is required");
    expect(policies()).toContain("A policy created from a template is ordinary, `enforcement = \"warn\"`, and records the template's id in `template`.");
    const templates = xanoscriptDocs({ topic: "policy-templates" }, ON).documentation;
    expect(templates).toContain('set `template = "<id>"`, use its summary as the `statement`');
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    expect(policyDoc.endpoints?.find(ep => ep.path.endsWith("/policy/parse"))?.response?.description).toContain("duplicate_of ({id, key, title} of the live policy with the same template and rules, or null)");
    expect(meta).toContain("with no template and no key, the lowest free POL-001, POL-002…");
    const cli = handleCliDocs({ topic: "policy" }, ON);
    expect(cli).toContain("recording the template's id in the policy's template field");
    expect(cli).toContain("Without --key the platform names the policy: the template's key, with a free numeric suffix when it is taken");
  });

  it("gives every exception its reason, and an object exception its guid", async () => {
    const catalogue = JSON.parse(read("../../scripts/policy-catalogue.json"));
    for (const item of catalogue.items) {
      const spec = item.params.except_objects;
      expect(spec, item.id).toMatchObject({ type: "exception[]", exception: "object", items: { type: "object_ref" }, default: [] });
      expect(Object.keys(spec.properties)).toEqual(["kind", "guid", "name", "reason", "by", "at"]);
      expect(item.scope_fields.map((field: { name: string }) => field.name)).toContain("except_objects");
      expect(item.params.except_tags).toMatchObject({ type: "exception[]", exception: "tag" });
    }
    const description = catalogue.items.find((item: { id: string }) => item.id === "object.description_required").params.allowed_fields;
    expect(description.default).toEqual([{ value: "id", reason: "Platform default" }, { value: "created_at", reason: "Platform default" }]);
    expect(Object.keys(description.properties)).toEqual(["value", "reason"]);
    const vocabulary = catalogue.items.find((item: { id: string }) => item.id === "object.tag_vocabulary").params.allowed_tags;
    expect(vocabulary.type).toBe("string[]");
    const login = catalogue.templates.find((template: { id: string }) => template.id === "endpoints_need_login");
    expect(login.rules[0].params.except_tags).toEqual([{ value: "public", reason: "Endpoints tagged public are deliberately open" }]);
    const text = policies();
    expect(text).toContain("## Exceptions");
    expect(text).toContain("- **A value exception** is `{value, reason}`");
    expect(text).toContain("`except_tags[0]: an exception is {value, reason}; write {value: \"public\", reason: \"why it is allowed\"}.`");
    expect(text).toContain("It is matched by guid, so it survives renames, branches and deploys.");
    expect(text).toContain("- `table.write_location_restricted.allowed_tags` (tag). Example: `[{\"value\":\"audit-writer\",\"reason\":\"Reviewed and allowed\"}]`");
    expect(text).toContain("an object exception (`except_objects`), an allowlist entry or an `allowed_secrets` fingerprint");
    // The exception example is a policy the language server parses.
    const example = [...text.matchAll(/```xs\n([\s\S]*?)```/g)].map((match) => match[1]).find((block) => block.includes("except_objects"));
    expect(example).toContain('except_objects: [{kind: "query", guid: "8f1c2a7e-0b4d-4c55-9a1e-3d2f6b7c8e90", name: "GET /health", reason: "Health probe for the load balancer"}]');
  });

  it("stores every gated check with its outcome, and pages the run list", () => {
    const text = policies();
    expect(text).toContain("with its `outcome` (`allowed`, `blocked` or `allowed_with_override`), its `override` `{reason, by, at}`");
    expect(text).toContain("A refused change's run never becomes the branch's latest run or a gate's baseline.");
    const list = policyDoc.endpoints?.find(ep => ep.method === "GET" && ep.path.endsWith("/policy/run"));
    expect(list?.parameters?.map(param => param.name)).toEqual(["workspace_id", "branch", "page", "per_page", "trigger", "outcome", "scope", "q", "sort", "order", "latest_only"]);
    expect(list?.response?.description).toContain("{items, curPage, nextPage, prevPage, itemsTotal}");
    expect(list?.response?.description).toContain("counts: {findings, block, warn, errors, policies_checked, policies_failing, policies_off, objects_checked, objects_failing {total, block, warn}}");
    const findings = policyDoc.endpoints?.find(ep => ep.path.endsWith("/run/{run_id}/findings"));
    expect(findings?.parameters?.find(param => param.name === "block")?.description).toContain("true keeps the findings of Block policies, false those of Warn policies");
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    expect(meta).toContain("a policy_check whose block_finding_ids name the Block findings listed and whose block_total counts them all");
    expect(policyDoc.endpoints?.find(ep => ep.path.endsWith("/run/{run_id}/summary"))?.response?.description).toContain("each entry {value, block, warn}");
    const cli = handleCliDocs({ topic: "policy" }, ON);
    for (const flag of ["--page", "--per-page", "--trigger", "--outcome", "--scope", "--sort", "--order", "--latest-only", "--block", "--warn"]) expect(cli).toContain(flag);
    expect(cli).toContain("xano policy runs --page 2 --trigger merge --outcome blocked");
    expect(cli).toContain("xano policy runs 1674 --block --policy AUTH-001 --severity critical");
    expect(cli).toContain("For CI, key on policy_check.block in -o json rather than on status: Warn findings arrive as status fail with block false.");
  });

  it("carries the check catalogue exactly as the generator renders it from the committed catalogue", async () => {
    const generator = await import(new URL("../../scripts/gen-policy-check-docs.mjs", import.meta.url).href);
    const markdown = readFileSync(generator.POLICIES_MD, "utf8");
    const catalogue = JSON.parse(readFileSync(generator.CATALOGUE, "utf8"));
    expect(generator.splice(markdown, generator.renderSections(catalogue))).toBe(markdown);
    expect(generator.renderTemplates(catalogue)).toBe(readFileSync(generator.TEMPLATES_MD, "utf8"));
  });

  it("lists the templates in their own topic, with their checks and what each leaves to fill, and points at it", () => {
    const templates = xanoscriptDocs({ topic: "policy-templates" }, ON).documentation;
    expect(resolveTopic("policy-template", ON)).toBe("policy-templates");
    expect(resolveTopic("policy", ON)).toBe("policies");
    expect(xanoscriptDocs({ topic: "readme" }, ON).documentation).toMatch(/^\| `policy-templates` /m);
    expect(templates).toContain("**Prefer a template.**");
    // A template's own example wins; a need it gives none for shows its check's catalogue example.
    expect(templates).toMatch(/^\| `tables_classified` \| `CONV-023` \| low \| Every table is classified \| `object.tag_required` \| `tag_set` \(e.g. `\["public","internal","confidential","restricted"\]`\) \|  \|$/m);
    // Framework tags by label, with the platform's note beside them.
    expect(templates).toMatch(/^\| `endpoints_need_login` \| `AUTH-010` \| .* \| SOC 2, HIPAA \|$/m);
    expect(templates).toMatch(/^\| `no_secrets_in_code` \| `SEC-012` \| .*PCI DSS \|$/m);
    expect(templates).toContain("They don't make a workspace compliant, and Xano doesn't track changes to these frameworks.");
    expect(templates).toMatch(/^\| `reads_are_paged` \| `PERF-001` \| medium \| Endpoints never return every row \| `statement.param_bound` \| _nothing_ \|/m);
    expect(templates).toMatch(/^\| `owner_team_tagged` \| `CONV-022` \| .* \| `tag_set` \(e.g. `\["team-billing"/m);
    expect(templates).toMatch(/^\| `agreed_tag_vocabulary` \| `CONV-020` \| .* \| `allowed_tags` \(e.g. `\[/m);
    expect(templates).toContain("## Conventions");
    // "Prefer a template" also sends a goal a recipe covers to the recipe.
    expect(templates).toContain("When a recipe covers the goal, follow it (see Recipes)");
    expect(policies()).toContain("and when a recipe covers the goal, follow it.");
    expect(policies()).toContain("Topic `policy-templates` lists the templates");
    expect(read("../../skills/xano-policies/SKILL.md")).toContain('`topic: "policy-templates"`');
  });

  it("gives each recipe goal-first, with the objects to build, what the user fills, its templates in order, its own rules and what no rule there can see", () => {
    const templates = xanoscriptDocs({ topic: "policy-templates" }, ON).documentation;
    const recipes = templates.slice(templates.indexOf("## Recipes"), templates.indexOf("## What no check can see"));
    expect(recipes).toContain("Nothing creates a recipe");
    expect(recipes).toContain("### Protect payment card data\n\n`protect_card_data` · PCI DSS.");
    // D41: the enforcement objects in words, each with the rule params its name fills; no prerequisites.
    expect(recipes).toContain("Build (the enforcement the rules point at):\n\n- **function** `charge_card`: Charges through the payment processor");
    expect(recipes).toContain("- **function** `require_approval`: ");
    expect(recipes).toContain("Fills `rules[2].before.functions`.");
    expect(recipes).toContain("The user's own objects and choices fill `approved_vendors_only.hosts`, `approved_vendors_only.providers`");
    expect(recipes).toContain("### Keep admin endpoints for admins\n\n`role_based_access`");
    expect(recipes).toContain("`rate_limiting`");
    expect(recipes).toContain("Show the user one plan");
    expect(recipes).not.toContain("First:");
    expect(recipes).toContain("1. `no_secrets_in_code` (`SEC-012`): No secrets are hardcoded\n2. `approved_vendors_only` (`VND-001`)");
    expect(recipes).toContain('- `rules[0]` Card numbers and security codes are never stored: `table.field_attribute_required` with `{"field_names":["card_number","cvv","cvc","pan"],"forbidden":true}`.');
    expect(recipes).toContain("Fill `before.functions`.");
    expect(recipes).toContain("No rule here can see: Spend caps; Task retries; Runtime data and copies between environments (see What no check can see).");
    // A recipe is named for its goal, never a framework.
    expect(recipes).not.toMatch(/^### .*(HIPAA|PCI|GDPR|SOC 2)/m);
    // Path scope, agent tool allowlists and retention age are checks now (D41), so no topic says otherwise.
    expect(templates).not.toContain("`path_prefix_scope`");
    expect(templates).toMatch(/^- \*\*Which roles exist and who holds them\*\* \(`role_design`\)/m);
    // Only the platform's own note speaks of compliance, to say the tags confer none.
    expect(templates).not.toMatch(/(?<!don't )makes? (a|the|your) workspace compliant/);
  });

  it("joins a rule's needs as it requires them: every need outside its needs_any group, and one of the group", () => {
    const templates = xanoscriptDocs({ topic: "policy-templates" }, ON).documentation;
    expect(templates).toMatch(/^\| `admin_endpoints_check_role` \| `AUTH-002` \| .* \| `functions` \(e\.g\. `\["require_admin"\]`\), and `tags` \(e\.g\. `\["admin"\]`\) or `paths` \(e\.g\. `\["admin"\]`\) \|/m);
    expect(templates).toMatch(/^\| `approved_vendors_only` \| .* \| `hosts` \(e\.g\. .*\) or `providers` \(e\.g\. /m);
    // A dotted need names a property of an object param, with the template's example for it.
    expect(templates).toMatch(/^\| `retained_data_has_age_limit` \| `RET-003` \| .* \| `tags` \(e\.g\. `\["retained"\]`\), `referenced_by\.max_age_days` \(e\.g\. `730`\) \|/m);
    expect(templates).toContain("`functions`, and `tags` or `paths`");
    const prose = policies();
    expect(prose).toContain("a list of two or more of its `needs` (`[]` when it groups none)");
    expect(prose).toContain("RET-003 needs `referenced_by.max_age_days`");
    expect(prose).not.toContain("needs_any: true");
    expect(prose).not.toContain("prerequisites");
  });

  it("scopes by what the platform knows (paths, endpoint_auth) and by tags for what it does not", async () => {
    const text = policies();
    const generated = text.slice(text.indexOf("<!-- BEGIN GENERATED: scope -->"), text.indexOf("<!-- END GENERATED: scope -->"));
    expect(generated).toMatch(/^- `paths` \(string\[\]\) — Endpoints whose path inside their API group/m);
    expect(generated).toMatch(/^- `except_paths` \(exception\[\]\) — Exclude endpoints whose path/m);
    expect(generated).toMatch(/^- `except_objects` \(exception\[\]\) — Exclude single objects, each by its kind and guid with the reason it is allowed/m);
    expect(text).toContain("Scope by what the platform already knows, then by tags for what it does not.");
    expect(text).toContain("Tags are for what the platform does not know: data classes, owner teams, deliberate exceptions.");
    expect(text).toContain("`api_groups`, `paths`, `verbs` and `endpoint_auth` select endpoints only");
    expect(text).not.toContain("Prefer tags to names.");
    const generator = await import(new URL("../../scripts/gen-policy-check-docs.mjs", import.meta.url).href);
    expect(generator.joinNeeds({ needs: ["functions", "tags", "paths"], needs_any: ["tags", "paths"] }, (n: string) => n)).toBe("functions, and tags or paths");
    expect(generator.joinNeeds({ needs: ["hosts", "providers"], needs_any: true }, (n: string) => n)).toBe("hosts or providers");
    expect(generator.joinNeeds({ needs: ["tags", "referenced_by.max_age_days"], needs_any: [] }, (n: string) => n)).toBe("tags, referenced_by.max_age_days");
  });

  it("says a policy request is one plan and one yes, and that building it is authoring, not fixing", () => {
    const prose = policies().replace(/\s+/g, " ");
    const authoring = prose.slice(prose.indexOf("## Authoring workflow"), prose.indexOf("1. Read the branch's existing policies"));
    expect(authoring).toContain("**A policy request is one plan and one yes.**");
    expect(authoring).toContain("show ONE plan: the objects to build, the changes to existing objects (tags, field attributes, attaching middleware), the policy (its key, and each rule with the names it points at) and what stays unchecked.");
    expect(authoring).toContain("Build nothing before the user says yes; after one yes, build all of it in the same change, objects before the policy that names them");
    expect(authoring).toContain("The yes covers exactly what the plan listed; anything else is asked again.");
    expect(prose).toContain("These rules are for fixing a finding. Building what a plan the user said yes to lists is authoring (Authoring workflow), not a fix.");
    expect(prose).not.toContain("propose it separately");
  });

  it("serves each check's uses, the statement names and object.settings_forbidden's settings in the policies topic", () => {
    const text = policies();
    expect(text).toContain('- `object.auth_required`: Endpoints that touch invoices require login. → `{"tables":["invoices"]}`');
    expect(text).toContain('- `stack.size_limit`: Functions hold at most 80 statements. → `{"max_statements":80,"object_kinds":["function"]}` — One rule per kind gives each kind its own limit.');
    expect(text).toContain("<!-- BEGIN GENERATED: statements -->");
    expect(text).toMatch(/^\| AI and LLM calls \| `ai.agent.run` \(args, allow_tool_execution\), .* \| There is no prompt statement/m);
    expect(text).toMatch(/^\| Email and messaging \| `util.send_email` /m);
    expect(text).toContain("Take the name from Statement names below");
    expect(text).toContain("- `agent`: `model_provider` (`amazon-bedrock`, `anthropic`");
    expect(text).toContain("`swagger.token` (string, secret)");
    expect(text).toContain("`gdpr` GDPR, `pci_dss` PCI DSS)");
  });

  it("says policy catalogue --template shows one template, each check lists its params, the head says what severity and enforcement do, and parse always shows severity", () => {
    const cli = handleCliDocs({ topic: "policy" }, ON);
    expect(cli).toContain("xano policy catalogue --template retained_data_has_age_limit");
    expect(cli).toContain("--template to one template id");
    expect(cli).toContain("an id of another kind names the flag that shows it");
    expect(cli).toContain("an object param's parts by their dotted path, as referenced_by.age_field");
    expect(cli).toContain("a Scope fields: line naming the scope fields it takes");
    expect(cli).toContain("off is not checked; warn, the default, reports problems and stops nothing; block stops a publish, merge or set live that adds a new problem or changes an object that already has one");
    expect(cli).toContain("orgs/*/tenants and orgs/{id}/tenants both select orgs/{org_id}/tenants");
    expect(cli).toContain("with the policy's severity always shown");
  });

  it("says policy catalogue prints uses, recipes and what no check can see, and policy create refuses a recipe id", () => {
    const cli = handleCliDocs({ topic: "policy" }, ON);
    expect(cli).toContain("Each check follows with its own params under Params:");
    expect(cli).toContain("and its uses (a goal in a customer's words");
    expect(cli).toContain("The catalogue ends with what no check can see");
    expect(cli).toContain("--recipe to one recipe id");
    expect(cli).toContain("the three flags cannot be combined");
    expect(cli).toContain("xano policy catalogue --recipe protect_card_data");
    expect(cli).toContain("a recipe id given to --template is refused with the recipe's templates");
    // D41: recipes name the objects to build; create reads needs_any as a group and fills dotted needs.
    expect(cli).toContain("the enforcement objects to build (each object's kind, name and role, and the rule params its name fills");
    expect(cli).not.toContain("what to set up first");
    expect(cli).toContain("an empty group by its options (1.tags or 1.paths)");
    expect(cli).toContain("--param 'referenced_by.max_age_days=730'");
    // The summary's head and the template rules (usability round 1).
    expect(cli).toContain("The summary opens with an index");
    expect(cli).toContain("Fill: functions, and tags or paths");
    expect(cli).toContain("--help shows a minimal policy file");
  });

  it("says an indexed reference is read as the part before its first [, with a rule warning on a rule entry", () => {
    const prose = policies().replace(/\s+/g, " ");
    expect(prose).toContain("a read is matched by the part before its first `[`, so `$input.rows[0].sku` in code is a read of `$input.rows`.");
    expect(prose).toContain('`must_not_reference "$input.rows[0]" is read as $input.rows: a reference is matched by the part before the first [.`');
    expect(prose).toContain("(`must_reference`, `must_not_reference`, `before.must_reference` and `compare_to`)");
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
    // The file name is the key: a key changes only when asked, by a rename, never by a move.
    const prose = stub.replace(/\s+/g, " ");
    expect(prose).toContain("**The file name is the key.** A policy lives at `policies/<KEY>.xs`, and Studio refuses to publish a policy file named otherwise.");
    expect(prose).toContain("Never move or copy a policy to a file named anything other than its key; if asked to, explain that the file name is the key and offer a key change instead.");
  });

  it("says tenant, sandbox and release pushes carry policy files, and when they leave them out", () => {
    for (const text of [handleMetaApiDocs({ topic: "policy" }, ON), handleCliDocs({ topic: "policy" }, ON)]) {
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
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }, ON), handleCliDocs({ topic: "policy" }, ON)]) {
      expect(text).toMatch(/release[^.]*(archive|import)[^.]*carries policies/);
    }
    expect(handleCliDocs({ topic: "policy" }, ON)).toContain("nothing is stored");
  });

  it("names every route and command that overrides a set-live or publish gate, and the branch a refused set-live keeps", () => {
    const text = policies();
    expect(text).toContain("`import-schema` with `setlive`");
    expect(text).toContain("`payload.branch`");
    expect(text).toContain("`override_reason` on the Metadata API create and save routes");
    expect(text).toContain("`xano function create` and `xano function edit` take `--policy-override");
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    expect(meta).toContain("import-schema with setlive");
    expect(meta).toContain("payload.branch {id, label}");
    expect(meta).toContain("the create and save routes of the gated objects");
    const cli = handleCliDocs({ topic: "policy" }, ON);
    expect(cli).toContain("function create and function edit exit 2");
    expect(cli).toContain("branch set_live exit 2");
    // Both function create and function edit list the flag.
    expect(handleCliDocs({ topic: "function" }, ON).match(/policy-override/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("says agents, MCP servers (their prompt and resource lists included) and realtime channels are gated, and lists every kind the publish gate never sees", () => {
    expect(policies()).toContain("an agent, an MCP server or a realtime channel to the workspace's **live** branch only");
    expect(handleMetaApiDocs({ topic: "policy" }, ON)).toContain("agents, MCP servers and realtime channels: tables, API groups");
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }, ON)]) {
      expect(text).not.toContain("Tables, API groups and environment variables are not draftable");
      expect(text).toMatch(/[Tt]ables, API groups, environment variables, workspace and branch settings, realtime servers, and MCP prompts and resources are saved without/);
      expect(text).toMatch(/changes the server, so that save is gated/);
      expect(text).not.toContain("A secret pasted into a live agent's settings");
    }
  });

  it("says a read-only session writes no policy and the tenant reads need tenant_center read", () => {
    const refusal = "This is a read-only session. Enable editing to modify this resource.";
    expect(policies()).toContain(refusal);
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    expect(meta).toContain(refusal);
    expect(meta).toContain("tenant_center read");
    expect(meta).toContain("at most 200 ids");
  });

  it("documents the refusals for exact copies, remediation and reserved blocks", () => {
    const text = policies();
    expect(text).toContain("A policy with exactly these rules already exists: KEY. Change a parameter or scope to add another.");
    expect(text).toContain('policy: "remediation" was removed; put the guidance in the policy statement.');
    expect(text).toContain('Policy block "<name>" is reserved. Policies support rule blocks only.');
    expect(handleMetaApiDocs({ topic: "policy" }, ON)).toContain("policy_duplicate");
  });

  it("says lower plans cap policies without naming the caps, and gives the retired param's replacement", () => {
    for (const text of [policies(), handleMetaApiDocs({ topic: "policy" }, ON)]) {
      expect(text).toMatch(/lower plans cap the policies on each branch/i);
      expect(text).toContain("Pro and above are unlimited");
      expect(text).not.toMatch(/Free \d|Essential \d/);
    }
    const database = xanoscriptDocs({ topic: "database" }, ON).documentation;
    expect(database).toContain('param_names: ["output"]');
    expect(database).not.toContain('param: "output"');
  });

  it("lists the policies topic in both tier docs", () => {
    expect(xanoscriptDocs({ tier: "survival" }, ON).documentation).toMatch(/^survival, working, .*, policies$/m);
    expect(xanoscriptDocs({ tier: "working" }, ON).documentation).toMatch(/^\| `policies` \|/m);
  });

  it("gives a member without policy read an object's coverage and their own push findings, and keeps draft checks in Studio", () => {
    const text = policies();
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    const cli = handleCliDocs({ topic: "policy" }, ON);
    // The coverage route needs the object's read permission, never workspace:policy.
    for (const doc of [text, meta]) {
      expect(doc).toContain("policy/object/coverage");
      expect(doc).toContain("policy_object_permission_required");
      expect(doc).toContain("Reading this function needs the workspace:function read permission.");
      expect(doc).toContain('access: "coverage"');
      expect(doc).toContain('scope: "pushed_objects"');
    }
    expect(meta).toContain("GET /workspace/{workspace_id}/policy/object/coverage");
    expect(cli).toContain("xano policy coverage <type>:<id>");
    expect(cli).toContain('access: "coverage" and scope: "pushed_objects"');
    // forbidden is only an older platform's answer now.
    expect(meta).toContain("The workspace multidoc import answers all six.");
    expect(meta).not.toContain("not_applicable, disabled and forbidden load");
    expect(cli).not.toContain("disabled, forbidden, unavailable");
    expect(meta).toContain("An older platform answers such a caller forbidden");
    // Refusals name the Block policies to everyone; the findings stay a reader's.
    expect(text).not.toContain("to any other caller, no policy");
    expect(text).toContain("to every caller, policy read or not");
    expect(text).toContain("in its message, the keys of the policies they come from");
    expect(meta).toContain("the policies they come from, to every caller");
    // In Studio's words: objects only when every Block finding is listed, failures to a non-reader.
    expect(meta).toContain("Publish blocked by 1 object failing in Block. The failures come from CONF-001.");
    expect(meta).toContain("always failures for a caller without workspace:policy read");
    expect(meta).not.toContain("how many the change introduced and how many are on objects it changes");
    expect(text).not.toContain("how many the change introduced and how many are on objects it changes");
    // The draft check is Studio's alone.
    expect(text).toContain("**Check draft**");
    expect(text).toContain("It is Studio-only: the Metadata API, the CLI and the MCP have no draft check");
    expect(meta).toContain("the Metadata API has no draft check");
    expect(meta).not.toContain("evaluate-draft");
    expect(cli).toContain("Drafts are checked in Studio");
  });

  it("names the workspace object's id, the trigger fallback and the coverage command's exit codes", () => {
    const text = policies();
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    const cli = handleCliDocs({ topic: "policy" }, ON);
    // The workspace object resolves only by the workspace's own id.
    expect(text).toContain("the workspace object's id is the workspace's own id: `workspace:17`");
    expect(meta).toContain("for workspace, the workspace's own id");
    expect(cli).toContain("for workspace, the workspace's own id (workspace:17)");
    // A trigger that cannot be told apart is checked against instance:workspace.
    // ...and one whose obj_type cannot be resolved needs every trigger scope.
    expect(text).toContain("and all four for one whose `obj_type` cannot be resolved");
    expect(meta).toContain("and all four for one whose obj_type cannot be resolved");
    for (const doc of [text, meta]) expect(doc).not.toMatch(/obj_type`? is unknown/);
    // policy coverage exits 1 on a refusal, and its chip reads as the CLI prints it.
    expect(cli).toContain("Exits 0 when it answers, and 1 on a refusal or a malformed type:id.");
    expect(cli).not.toContain("Always exits 0");
    expect(cli).toContain("Policies · 3 apply · not checked yet");
  });

  it("names coverage's could_not_check status and count, and says check_failed only for a policy that applies here", () => {
    const meta = policyDoc.endpoints?.find(ep => ep.path.endsWith("/object/coverage"))?.response?.description ?? "";
    const cli = handleCliDocs({ topic: "policy" }, ON);
    expect(meta).toContain("summary {state, applies, block, warn, passing, not_checked, could_not_check}");
    expect(meta).toContain("findings (Policies <block> block · <warn> warn)");
    expect(cli).toContain("the chip (Policies 1 Block · 1 Warn");
    expect(meta).toContain("could_not_check (the newest run could not check it: a rule of it could not run, or the run stopped on an error before it)");
    expect(meta).toContain("check_failed (Last check failed: only when a policy that applies here could not be checked)");
    expect(meta).toContain("even when the run errored on another policy");
    // passing no longer claims the whole run had no error.
    expect(meta).not.toContain("without an error and found nothing here");
    expect(cli).toContain("failing, passing, couldn't check or not checked yet");
    expect(cli).toContain("6 passing · 1 couldn't check · 1 not checked yet");
  });

  it("says a draft check needs update and is rate limited and size capped, and how a non-reader's push blocks", () => {
    const text = policies();
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    const cli = handleCliDocs({ topic: "policy" }, ON);
    // Someone who may not edit an object has no draft of it.
    expect(text).toContain("**update** for the draft check");
    expect(text).toContain("| Studio's draft check | none: the object kind's own update permission | `workspace:read` |");
    expect(text).toContain("Checking a draft of this function needs the workspace:function update permission.");
    expect(text).toContain("`policy_draft_check_rate_limited`");
    expect(text).toContain("`policy_draft_too_large`");
    // A forbidden trigger reads as a missing one.
    for (const doc of [text, meta]) expect(doc).toContain("answered exactly as one the branch does not hold");
    // A non-reader's push: elsewhere counted, the workspace object, block as a reader's.
    for (const doc of [text, meta]) {
      expect(doc).toContain("elsewhere {total, block, basis}");
      expect(doc).toMatch(/findings, block_findings, elsewhere/);
      expect(doc).toMatch(/workspace:settings`? read/);
      expect(doc).not.toContain("status, blocking and the counts are about those findings");
    }
    expect(text).toContain("`block` is what a reader's push of the same change says");
    expect(meta).toContain("block is what a reader's import of the same change says");
    expect(cli).toContain("On objects this push did not list: N new findings (B Block), counted, not named.");
    expect(cli).not.toContain("which is about those findings");
    // Every gate answer names the Block policies; coverage answers are cached briefly.
    expect(text).toContain("introduced, changed, existing, run_id, outcome, can_override, sources, findings, truncated");
    expect(meta).toContain("can_override, sources, findings (first 100, policy readers only)");
    expect(meta).toContain("message, sources, findings, truncated");
    for (const doc of [text, meta]) expect(doc).toMatch(/cached for 60 (s|seconds) by object/);
  });

  it("says what elsewhere's basis means, limits a non-reader's merge review and renews slot leases", () => {
    const text = policies();
    const meta = handleMetaApiDocs({ topic: "policy" }, ON);
    const cli = handleCliDocs({ topic: "policy" }, ON);
    expect(text).toContain("elsewhere {total, block, basis}");
    expect(text).toContain('with `basis: "introduced"`, those the push introduced');
    expect(text).toContain('with `basis: "all"`, when no such baseline was known, every finding there');
    expect(meta).toContain("elsewhere {total, block, basis}");
    expect(meta).toContain('with basis "all", when no such baseline was known');
    expect(cli).toContain("N findings instead of N new findings when elsewhere.basis is all");
    for (const doc of [text, meta]) expect(doc).toContain("policy_merge_review_rate_limited");
    expect(text).toContain("Too many merge reviews in the last minute, so the policy check wasn’t previewed.");
    expect(text).toContain("a slot's lease is renewed between rules while its check runs");
    expect(meta).toContain("a slot's lease is renewed between rules while its evaluation runs");
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

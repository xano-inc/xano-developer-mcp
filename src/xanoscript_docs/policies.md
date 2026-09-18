# Workspace policies (MVP)

Requires a platform build with policy support. A policy is its human description plus deterministic rules, saved as branch-scoped workspace XanoScript. Templates only seed an editable document: there is no template ID, inheritance or later synchronization.

## Quick Reference

```xs
policy "AUTH-EXAMPLE" {
  title = "Require authentication"
  statement = "Endpoints require authentication unless the endpoint or its API group is tagged public."
  lifecycle = "active"
  enforcement = "advisory"
  severity = "high"

  rule {
    check = "query.auth_required"
    params = { except_tags: ["public", "xano:quick-start"] }
  }
}
```

The key is written quoted, `policy "AUTH-EXAMPLE" {`, which is the form the platform emits in canonical source (parse results, `source` on a read, `workspace pull`). An unquoted key of letters, digits, `.`, `_` and `-` parses too, but write the quoted form so your source matches what comes back.

**A policy file carries no comments.** A comment inside a policy block is refused outright, whether it sits on its own line or trails a value. `//` and `/* */` both get the same sentence, naming the line they are on:

```
line 3: policy files cannot contain "//" comments. Put the explanation in the policy's statement, rationale or narrative.
```

with `"/* */"` in place of `"//"` for a block comment. For a trailing comment — `severity = "high" // critical | high` — the message names that line and the position points at the comment, not at the value. `#` is a plain syntax error: `Syntax error: unexpected '#'`. Never annotate policy source; put the explanation in `statement`, `rationale`, `narrative` or a rule's `title`.

Use `advisory` while customizing a seed. `mandatory` findings participate in gates. A `draft` policy is not evaluated; an `active` policy is eligible. **Write a new policy `lifecycle = "active"` with `enforcement = "advisory"`** — the same pair a template enables with. It blocks nothing while its findings are reviewed, and, unlike a draft, it is actually evaluated, so the author can see what it reports. Reach for `draft` only to park a policy you do not want evaluated at all. Policies can also include rationale, narrative, domain, owner, scope and tags. `owner` is a map of who answers for this policy — `owner = { name: "Dana Whitaker", role: "Information Security", email: "dana@lab.example" }` — with exactly the keys `name`, `role` and `email`; a scalar is refused (`owner must be a map of who answers for this policy: owner = { name: "", role: "", email: "" }.`). Long text such as `narrative` can use a `"""` triple-quoted multiline string. `tags` is a list of strings, for example `tags = ["soc2", "hipaa"]`, the same syntax as tags on any other workspace object; there is no separate framework/mapping concept, a tag is simply how a customer labels a framework. Free-form policy `scope` describes intent; actual check selection is determined by the check's parameters.

`severity` says how much a violation of this policy matters. It orders findings in reports, and it never blocks a merge — enforcement does. Its four values are `critical`, `high`, `medium` and `low`; nothing else is accepted. It defaults to `medium`, and canonical source omits the line at that default. `lifecycle` and `enforcement` are always written, because they are what decide whether a policy blocks.

Each rule selects a built-in check and supplies literal parameters:

- **A rule cannot be named.** Only `rule { ... }` is legal; `rule foo { ... }` is refused with `A rule cannot be named. Write "rule {" — rules are identified by position (KEY.R1, KEY.R2…).` A rule takes the id `<KEY>.R<n>` from its position, so the first rule of `AUTH-EXAMPLE` is `AUTH-EXAMPLE.R1`. The same goes for the JSON form: a custom `rules[].id` is refused with that sentence, and an echoed `<KEY>.R<n>` is ignored and re-derived. To give a rule a human name, set its `title`.
- On an existing policy, keep the order of existing rules and add new rules at the end: stored runs cite rule ids, and ids follow position.
- A rule `title` is optional. An unnamed rule is displayed by its check's label — author title, else check label, else rule id, everywhere the platform names a rule. Title a rule only where its scoping makes the check's own label misleading.
- **A rule has no `severity`.** Both surfaces refuse it and say the same thing, prefixed by the rule's position: `"severity" is set on the policy, not on a rule.` Every finding carries its policy's severity.
- `params` lists only what the rule sets. Every omitted parameter takes the catalogue default, and canonical source drops any value equal to that default, so a rule that configures nothing has no `params` line. The stored document stays fully expanded. Every read — the policy GET and list, export, `workspace pull` and the agent's file view — serves `source` generated from the stored definition, never the string stored at the last save, so a policy saved under an older grammar still reads back as source today's parser accepts; the stored string itself is refreshed on the policy's next save.

## Authoring workflow

1. Read the branch's existing policies and the instance's check catalogue. The catalogue is the only source of truth for what each check reports, which object kinds it inspects and the exact parameters it accepts.
2. Write one `policy KEY { ... }` document in `policies/KEY.xs`. Customize its key, statement and rules; do not keep a template association.
3. Validate and format through the native `POST /api:meta/workspace/{id}/policy/parse` endpoint with `{source}`. The result contains `{policy, source}` and writes nothing. With the authenticated Xano MCP, use its policy parse tool.
4. Save canonical source using `POST /policy` (create) or `PUT /policy/{id}` (update) with `{branch, data: {source}}`. Do not combine source with structured fields. **To change an existing policy, update it by its id** — read the id from the policy list (`xano_list_policies`, `xano policy list -o json`), take the `source` a read returns, edit it, and send it to `PUT /policy/{id}` (the authenticated MCP's save tool with `policy_id`). This is also how a `draft` becomes `active`: the same policy id, with `lifecycle = "active"` in the source. A `POST` whose key already exists is refused, naming the policy that holds it — `A policy with key "AUTH-001" already exists on this branch (policy id 12, "Authentication baseline"). To change it, update policy id 12 instead of creating a new one.` — and a `PUT` whose source carries another policy's key says which id is which. The `source` a read returns is always generated from the stored definition in the current grammar, so it is safe to send back unchanged (a no-op) or edited. Add an optional `message` (and `description`) to label the Version History entry the save creates. The server owns versioning: see below.
5. Evaluate the same branch and inspect its findings. Runs made before edits are historical evidence, not current approval. A run snapshots the policies it checked: each policy's `statement` as written at run time and, per rule, its display `label` and the resolved `params` the check actually ran with (values that resolved to nothing are omitted, and an empty map serializes as `[]`). Runs retained from before the platform recorded those carry none of them. `xano policy status --run-detail` prints them.

Policies also travel in the platform's workspace multidoc import/export. Use the official CLI's `workspace pull` and `workspace push` flow for a local workspace. The authenticated MCP supports workspace exports and one-time upload URLs for large multidocs; upload processes the source on the instance. A mandatory finding reported after a push does not roll back that import. Merge uses fresh evaluation.

Inside Xano's own agent, the instance serves a platform skill named `xano-policies` in `auto` mode, generated from the live check catalogue. It carries this file format, every check id and its parameters, and the authoring and honesty rules, so a policy request there needs no pasted prompt; there is nothing to install or enable beyond the `policies` feature. It is the agent-side counterpart of this document, not a substitute for the instance catalogue.

## Versioning

Policies version exactly like every other Xano object: one Version History entry per real change, with the author, the optional `message` and `description`, and the whole policy as it was.

- `version` on a policy is the index of its newest history entry. It moves only when the definition really changes, so it names an entry a reader can open rather than counting writes.
- A save whose definition matches the stored one **does nothing at all** — no new version, no `updated_at`, no history entry, no audit record — and the response carries `unchanged: true`. A real save carries `unchanged: false`. Re-sending identical source is therefore safe and cheap; do not "touch" a policy to force a version.
- Formatting is not content: sending the same definition as expanded source, or as sparse canonical source, is the same no-op.
- An existing policy gets a lazy `Baseline` entry at its current number the first time it is really edited, so numbers are never migrated or renumbered.
- `PUT` also accepts an optional `last_updated_at` — the `updated_at` you last read. When it no longer matches, the write is refused with HTTP 400 `A previous update was performed before your request. Please reload your data and try again.` Omitting it (or sending null or `""`) means no check.
- Listing, diffing and restoring versions is a **dashboard** surface. The Metadata API has no version routes — for policies or for any other object type — so an API or MCP client can label a save but cannot read or restore history. A restore performed in the dashboard is an ordinary save: it moves `version` forward rather than rewinding it, and re-validates against today's check catalogue.
- A run's snapshot records the `version` it evaluated. Compare it with the policy's current `version` to know whether stored findings still describe the live definition.

## Releases and tenants

Policy definitions ship with the branch: a release, a tenant deploy, a release-to-workspace deploy, a backup restore and a workspace archive all carry every policy on the branch (drafts included) with its `guid` and `version`. Runs and Version History do not travel, and a tenant's stored runs are cleared on each deploy. On a tenant a policy is an inert, read-only copy that the next deploy replaces: nothing evaluates it there, and the merge gate cannot fire because a tenant has a single branch. A policy can never block a deploy, restore or archive import. Those copies keep the fields the receiving platform knows and drop the rest, and a policy that still cannot be read (for example a check the tenant's older platform does not have) is skipped with a `policy:import_skipped` warning in the audit log, naming the policy and the reason, while everything else imports. Authored writes (Metadata API, Studio, `workspace push`) stay strict.

## Check catalogue

A rule selects one built-in check and supplies literal parameters. Unknown check IDs and parameter names are rejected when saving. Read the instance catalogue (`GET /api:meta/workspace/{id}/policy/check` or `xano policy catalogue -o json`) for current types, defaults, allowed values, nested properties and examples.

Every entry carries a human `label` beside its id; that label is what names a rule whose author gave it no `title`. In the table, `name*` is required. `1 of (a, b)` requires at least one non-empty value or enabled boolean; each member is individually optional. Every check also accepts the shared scope parameters below.

| Check | Label | Behavior | Parameters |
| --- | --- | --- | --- |
| `db.where_constraint_required` | Reads constrain a required field | Requires db.query and db.get reads to include a predicate on the selected field. If compare_to is set, that same predicate must reference it. Checks nested condition groups syntactically; it does not prove the condition holds on every Boolean path. | `table_selector`, `field*`, `compare_to` |
| `literal.credential_shape` | Definitions avoid recognizable credential literals | Reports known credential-shaped string literals in selected locations. Scanning function stacks also reports literal encryption keys and IVs, regardless of the selected patterns. Findings include locations and pattern names, never secret values. | `patterns`, `locations` |
| `object.settings_forbidden` | Objects avoid forbidden settings | Reports objects whose saved settings match all configured predicates. Checks stored values; inherited runtime settings are not resolved. | `object_kind*`, `when*` |
| `outbound.vendor_allowlist` | Outbound calls go only to approved vendors | Reports unapproved HTTP hosts, cloud and email providers, and agent model providers. Empty allowlists report destinations as not yet reviewed. Dynamic or missing destinations are reported as unresolved; environment secrets are not read. | `kinds`, `hosts`, `providers` |
| `query.auth_required` | Endpoints require authentication | Requires each endpoint in scope to require authentication. Exclude deliberate public endpoints with except_tags (on the endpoint or its API group) or narrow the rule with api_groups or verbs. Checks the saved authentication setting; authorization logic is not evaluated. | _scope only_ |
| `query.input_rules` | Inputs declare types, filters and bounds | Checks declared query inputs for required types, filters, limits, usage and names. Enable at least one condition. Filter requirements apply to text inputs; types come from declarations. | 1 of (`type_by_name`, `filters_required`, `paging_max_required`, `path_params_forbidden`, `unused_forbidden`, `inputs_required`, `filter_min`) |
| `query.middleware_required` | Endpoints attach required middleware | Requires every named middleware to be attached and active. Resolves query, API group and branch or workspace defaults for pre- and post-middleware. Checks attachment, not middleware behavior. | `middleware*` |
| `query.statement_required` | Endpoints call a required function or statement | Requires a matching statement or function call in the query's own stack, optionally first or containing specified references. Confirms presence in the definition, not execution on every path. | 1 of (`statement`, `function`), `position`, `must_reference`, `when` |
| `query.tagged_table_access` | Endpoints reading tagged tables declare auth and an audit call | Requires queries reaching tagged tables to declare authentication and, optionally, call a named function. Table access through called functions counts; addons are optional. The required function call must be in the query's own stack. Only queries reaching a tagged table count as checked. | `follow_addons`, `tag*`, `auth`, `function` |
| `query.workflow_test_coverage` | Endpoints are covered by a workflow test | Requires each query to be called by api.call in a workflow test on the branch. Checks test definitions without running tests or checking assertions. Use scope to select the queries that need coverage. | _scope only_ |
| `stack.statement_forbidden` | Stacks exclude listed statements | Reports listed statements anywhere in an object's function stack, including nested branches and loops. | `statements*` |
| `stack.statement_order` | A statement comes before another | Requires a matching before statement ahead of the first matching after statement in the top-level stack. Nested statements and called functions are not followed. Objects with no after statement pass. | `before*`, `after*` |
| `statement.containment` | Statements meet nesting requirements | Requires or forbids enclosing blocks, or requires nested statements. Checks every nesting depth and branch; the matching block need not execute on every path. | 1 of (`must_be_inside`, `must_not_be_inside`, `must_contain`), `statement*`, `min_count` |
| `statement.expression_rule` | An expression follows reference and filter rules | Checks a parameter for required or forbidden references, literals, operators and filters. An omitted parameter is reported. References are inspected as written; intermediate variables are not traced. | `statement*`, `param*`, `must_reference`, `must_not_reference`, `operators_forbidden`, `literals_forbidden`, `filters_forbidden`, `filters_required` |
| `statement.param_bound` | A numeric parameter stays within bounds | Requires a numeric literal within the inclusive bounds. Reports missing, non-numeric and unresolved values. Bounds use the parameter's native units. | 1 of (`min`, `max`), `statement*`, `param*`, `unit` |
| `statement.param_forbidden` | A parameter avoids forbidden values | Reports a parameter set to a forbidden literal value, or a computed value that cannot be resolved. An omitted parameter passes. | `statement*`, `param*`, `values*` |
| `statement.param_not_from_input` | Protected fields avoid direct request input | Reports whole-record assignments from $input, $input.new or $input.old, and protected fields assigned directly from request input. Intermediate variables are not traced. | `statement*`, `param`, `fields` |
| `statement.param_required` | Statements explicitly set a required parameter | Requires an explicit parameter on matching statements. For output, requires a customized field list — db.query and db.get write one as output = ["id", "name"], a static list of field names, where a dotted entry reaches inside a paged result (items.book_name) — and can also check for fields marked sensitive in the table schema. | `statement*`, `param*`, `when_table_tag`, `follow_addons`, `must_exclude_sensitive_fields` |
| `table.auth_table_rules` | Endpoints use the single auth table | Requires exactly one auth-enabled table across the branch. Queries that declare authentication must use that table. Scope narrows the checked objects and queries; the table count always covers the full branch. | _scope only_ |
| `table.coverage_required` | Tables are referenced by a required object | Requires each selected table to be referenced by a matching object, directly or through called functions. Scope selects tables; referenced_by selects the objects that provide coverage. Only tables count as checked. | `table_selector`, `referenced_by` |
| `table.field_attribute_required` | Schema fields have required attributes | Checks selected schema fields for a required attribute, type or presence, or forbids them. When names and types are both set, a field must match both. Reads schema definitions only. | 1 of (`field_names`, `field_types`), `attribute`, `value`, `type`, `require_exists`, `forbidden` |
| `table.tag_required` | Tables with matching fields carry a tag | Requires a table tag when a schema field matches both the selected type and one of the selected names. Reads schema definitions only. Only tables with a matching field count as checked. | `field_type`, `field_names*`, `tag*` |
| `table.view_hide_required` | Saved views hide sensitive fields | Requires saved table views to hide every field marked sensitive in the table schema. Checks each view's hidden-column list. Tables without saved views pass. Select tables with tags. | _scope only_ |
| `table.write_location_restricted` | Table writes use approved functions or tags | Restricts writes to a table to approved functions or tagged objects. Checks where each write is defined; a caller can use an approved function without defining the write itself. | `table*`, `fields`, `statements`, `allowed_functions`, `allowed_tags` |
| `test.assertion_required` | Tests assert anonymous calls are rejected | Requires a workflow test that calls each selected endpoint anonymously (no token, or a literal null, empty or false token) and asserts an authorization rejection (401, 403, unauthorized or forbidden). Endpoints that do not require authentication are skipped: they cannot reject an anonymous call. Recognizes a call expectation, an enclosing expect.to_throw, or a later assertion on the call's result. Tests are inspected, not run. | _scope only_ |
| `trigger.self_write_forbidden` | Triggers avoid direct writes to their own table | Reports database triggers that write to their own table, including bulk writes and add-or-edit. Inspects the trigger's own stack, including nested branches; writes inside called functions are not followed. | _scope only_ |
| `workspace.object_required` | Required objects exist | Requires a minimum count of objects matching the selected kind, name, tag and scope. Checks object presence, not behavior. | `object_kind*`, `tag`, `name`, `min_count` |

Closed value sets worth knowing without a catalogue round-trip:

- `policy.severity`: `critical`, `high`, `medium` (the default), `low`
- `policy.lifecycle`: `draft`, `active`
- `policy.enforcement`: `advisory`, `mandatory`
- `literal.credential_shape.patterns`: `stripe`, `aws`, `github`, `pem`, `url_credentials`
- `literal.credential_shape.locations`: `run`, `env`, `agent_settings`
- `object.settings_forbidden.object_kind`: `table`, `query`, `function`, `workflow_test`, `api_group`, `task`, `trigger`, `middleware`, `addon`, `channel`, `tool`, `agent`, `mcp_server`, `workspace`
- `outbound.vendor_allowlist.kinds`: `api.request`, `cloud`, `email`, `agent.llm`
- `query.statement_required.position`: `any`, `first`
- `statement.expression_rule.operators_forbidden`: `===`, `!==`, `==`, `!=`, `>=`, `<=`, `&&`, `||`, `~`, `+`, `-`, `*`, `/`, `%`, `<`, `>`
- `workspace.object_required.object_kind`: `table`, `query`, `function`, `workflow_test`, `api_group`, `task`, `trigger`, `middleware`, `addon`, `channel`, `tool`, `agent`, `mcp_server`, `workspace`

Nested object parameters and their keys:

- `db.where_constraint_required.table_selector` — keys `tag`, `has_field`, `has_fk_to`. Example: `{"has_field":"employee_id"}`
- `object.settings_forbidden.when` — keys `<setting.path>`. Example: `{"exception_policy":{"equals":"silent"}}`
- `query.input_rules.type_by_name` — keys `<input name>`. Example: `{"email":"email"}`
- `query.input_rules.filter_min` — keys `<filter name>`. Example: `{"min":8}`
- `query.statement_required.when` — keys `statement`, `table`, `fields`, `host`. Example: `{"statement":"db.edit","table":"employee"}`
- `stack.statement_order.before` — keys `statement`, `must_reference`. Example: `{"statement":"precondition","must_reference":["$auth"]}`
- `table.coverage_required.table_selector` — keys `tag`, `has_field`, `has_fk_to`. Example: `{"tag":"phi"}`
- `table.coverage_required.referenced_by` — keys `object_kinds`, `tags`, `same_table`. Example: `{"object_kinds":["task"],"tags":["retention"]}`

## Scoping a rule

Scope selects the objects a check inspects. All conditions must match; omitted or empty fields add no restriction. Individual check descriptions identify any branch-wide counts or related definitions consulted outside scope.

- `scope.object_kinds` (string[]) — Include these kinds from those supported by the check. One of `table`, `query`, `function`, `workflow_test`, `api_group`, `task`, `trigger`, `middleware`, `addon`, `channel`, `tool`, `agent`, `mcp_server`, `workspace`.
- `scope.api_groups` (string[]) — Queries in these API groups, matched by exact display name or canonical name.
- `scope.verbs` (string[]) — Queries with these HTTP verbs, matched case-insensitively.
- `scope.auth` (string) — Queries only: none selects queries without an auth table; required selects queries declaring one. Empty adds no restriction. One of `""`, `none`, `required`.
- `scope.tags` (string[]) — Include objects carrying any listed exact tag. Uses the object's own tags, not the tags of tables it reads; endpoints also carry their API group's tags.
- `scope.except_tags` (string[]) — Exclude objects carrying any listed exact tag. Endpoints also carry their API group's tags. Combined with top-level except_tags.
- `scope.tables` (string[]) — Select tables by exact name, or objects reaching any named table directly or through called functions.
- `scope.reaching_table_tag` (string) — Select objects reaching a table with this exact tag, directly or through called functions.

Non-empty top-level `api_groups`, `tables`, `verbs` and `tags` replace the corresponding `scope` values, and a non-empty top-level `endpoint_auth` (`required` or `none`) replaces `scope.auth`. Top-level and nested `except_tags` combine. API group, HTTP verb and auth filters select queries only and exclude other object kinds.

Xano already records whether an endpoint is public (its authentication setting), so never add a tag just to restate that. Use `endpoint_auth: "required"` to keep a rule to endpoints that require authentication (test coverage, required middleware), and `endpoint_auth: "none"` to state what public endpoints may not do, e.g. `stack.statement_forbidden` with `statements: ["db.edit", "db.del"]`. `query.auth_required` has no parameters of its own: a deliberately public endpoint is an ordinary exception, `except_tags: ["public"]`, on the endpoint or on its API group.

Prefer tags to names. A rule scoped with `tags` or `except_tags` keeps working when an API group or table is renamed, and a new object opts in by carrying the tag; a rule scoped with `api_groups` or `tables` must be edited whenever those names change. A name the branch does not have selects nothing: the run reports it as a warning on the rule's result (`warnings`) without changing the result's status.

Example: `params = { statements: ["db.add", "db.edit"], scope: { object_kinds: ["query"], verbs: ["GET"] }, except_tags: ["generated"] }`.

## Writing parameter values

- **Types:** `string[]` is a list of strings; `bool` requires true or false. `number` accepts finite numeric literals, not numeric strings. Both `min_count` parameters are `integer` with minimum 1. Bounds are inclusive and use the checked parameter's native units; `unit` only labels findings.
- **Object values:** use objects such as `{}` for selectors and maps. The catalogue publishes object defaults as `{}`. `value` in `table.field_attribute_required` accepts any literal, including null.
- **Statement names:** use an exact XanoScript name such as `db.add` or `api.request`; stored aliases such as `mvp:dbo_add` also work. A misspelled name is accepted on save and matches nothing, so the rule inspects no statements and passes (or, for a required-statement check, fails everywhere). Verify the name against statement documentation, then evaluate and read the rule result's `warnings`: a name that is not a XanoScript statement is reported there as `Statement "db.edt" is not a XanoScript statement name, so it matches nothing. Did you mean db.edit?` A stored alias containing `:` is compared as written and is never warned about.
- **Parameter paths:** use a name or dotted path such as `data.role`. Aliases include `per_page` for paging size, `where` for search conditions and `error` for the error message.
- **References:** match a reference or its child paths. `$auth` matches `$auth.id`; `$input.id` does not match `$input.id2`. Supported roots are `$input`, `$auth`, `$env`, `$var`, `$error` and `$output`. Quoted text is literal.
- **Literal comparison:** false differs from "false", and 0 differs from "0". Equal numbers match, including 1 and 1.0. Empty objects and lists share a stored representation and compare equally. This applies to forbidden literals, field attributes and setting equality.
- **Names:** table, function, middleware, tag, field and provider names match exactly. Hosts and HTTP verbs ignore case. Regex and wildcards are not supported; credential `patterns` selects built-in shapes.
- **Combined conditions:** field names and field types must match the same field; table selectors combine all conditions. Allowed write functions and tags are alternatives. `query.input_rules` needs an enabled condition and `statement.containment` needs a structural constraint. `statement.expression_rule` without extra constraints still requires the parameter to exist.
- **Tags:** `tags`, `scope.tags` and `except_tags` match the inspected object's own tags; an endpoint also carries the tags of its API group. `query.tagged_table_access.tag` and `table_selector.tag` match table tags, and check parameters such as `allowed_tags` read only the object's own tags.

## Findings

A finding carries `policy_key`, `policy_title`, `rule_id`, `rule_title`, `severity`, an `object` reference and a `message` saying what was found and where in the stack. `rule_title` is the rule's own title, else its check's label, else its id; `severity` is the owning policy's, so every finding of one policy shares it. A finding `id` is prefixed with the policy key when the rule id does not already name it, so two policies whose rules share an id still produce distinct findings. Guidance that applies to the whole policy, such as how to request an exemption, belongs in the policy `statement`. Some catalogue entries carry an optional static `fix_hint` string describing the usual fix for that check; it is the same for every rule that uses the check.

- `literal.credential_shape`: Move the literal into a workspace environment variable, reference it with $env, and rotate the exposed value.
- `outbound.vendor_allowlist`: Add the reviewed host to this check's hosts (or the provider to providers), or send the request to a destination that is already approved.
- `table.auth_table_rules`: Enable auth on exactly one table and point every query auth declaration at that table.
- `test.assertion_required`: Add a workflow test that calls the endpoint with no auth token and expects a 401/403, or expect.to_throw on unauthorized.

A rule that inspected nothing reports `0 checked` rather than a pass, which is how "the scope matched no objects" is told apart from "everything satisfied the rule".

## Validation and access

The standalone developer MCP's bundled language server does not validate policy syntax. It must not report these files as successfully validated. Use native policy parsing; do not rewrite a policy into another object type to satisfy the local validator.

Read, parse and evaluate need `workspace:policy` read access. Writes additionally need the matching operation scope and an admin/explore role. Existing tokens may need reissuing. The authenticated MCP takes instance and workspace from its request authentication; it does not accept arbitrary targets.

A policy is its description plus deterministic check rules. Checks inspect stored definitions and nothing runs at request time.

## Permissions

Three gates decide every policy request. A refusal is an HTTP 403 whose message says which gate answered.

| Gate | Applies to | Passes when | Refusal message |
| --- | --- | --- | --- |
| Feature | Every policy route | The instance has the `policies` feature enabled | `Policies are not enabled on this instance.` |
| Scope | Every policy route | The credential holds the `workspace:policy` level the operation needs, and so does the caller's role on that workspace | `Access Denied.` (OAuth: `insufficient_scope: workspace:read` or `workspace:write`) |
| Author | Writes only | The caller's instance role is `admin`, or `explore` on a free instance | `Policy changes require the admin role.` |

The scope level each operation needs:

| Operation | `workspace:policy` level | OAuth ceiling |
| --- | --- | --- |
| List, get, check catalogue, policies for an object, runs, one run, parse | `read` | `workspace:read` |
| Evaluate (run checks) | `read` | `workspace:read` |
| Create a policy | `create` | `workspace:write` |
| Update a policy, restore a version | `update` | `workspace:write` |
| Delete a policy | `delete` | `workspace:write` |
| `workspace pull` / export with policies included | `read` (without it the export still succeeds and omits policies) | `workspace:read` |
| `workspace push` / import of a policy file that differs from the stored policy | `create` or `update` | `workspace:write` |
| Archive import carrying policies | `create` and `update` (without them the archive imports and its policies are skipped, each skip written to the audit log); an import that would delete existing policies needs `delete` | - |

`workspace:policy` is a level set on a Metadata API access token and on a role's "Workspace Policies" permission; a per-workspace override on a member wins over the role. Both must allow the operation. A token created before policies existed carries no `workspace:policy` level, so it reads nothing until it is reissued. An OAuth token has no per-permission levels: `workspace:read` or `workspace:write` is its ceiling, and the role's permission decides the rest.

Who can author: creating, updating, deleting and restoring need the author gate on top of the scope. A `developer`, `readonly` or custom role is refused on writes even when its permission and token grant the full level; reissuing a token does not change that. Those roles can read policies and run checks.

Evaluate needs only `read`, so a reviewer or a CI credential can run checks. Storing the run is a write: from a read-only session, or an OAuth token without `workspace:write`, the evaluation returns its findings with `stored: false` and run id `0`, and the retained runs are untouched.

A policy file that is identical to the stored policy needs no write permission in a push: it is reported `unchanged` and skipped. A policy file that differs, pushed by a caller who may not author, refuses the whole push before anything is imported (`Policy files require the admin role; nothing was imported: KEY`). Exclude the policy files (`xano workspace push -e "policies/*"`) or pull again to push the rest.

What a policy reader can see: a finding names the object it is about - its type, name and id - and says where in the stack the problem is, for any object on the branch. `workspace:policy` read therefore shows object names and ids across the branch even to a role with no access to, say, the database or that API group. The credential check never prints the literal it matched. A merge that the gate refuses returns its blocking findings to the person merging, with or without `workspace:policy` read, because they need them to fix the branch.

Where policy text travels outside this permission: Git sync writes every policy file to the connected repository, so anyone with access to that repository can read them; and the workspace audit log records each policy change with the policy document, readable by anyone with the workspace logs permission.

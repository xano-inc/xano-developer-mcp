# Workspace policies (MVP)

Requires a platform build with policy support. A policy is its human description plus deterministic rules, saved as branch-scoped workspace XanoScript. Templates only seed an editable document: there is no template ID, inheritance or later synchronization.

## Quick Reference

```xs
policy AUTH-EXAMPLE {
  title = "Require authentication"
  statement = "Endpoints require authentication unless explicitly marked public."
  lifecycle = "active"
  enforcement = "advisory"
  severity = "high"

  rule AUTH-EXAMPLE.R1 {
    check = "query.auth_required"
    params = { public_tag: "public" }
  }
}
```

Use `advisory` while customizing a seed. `mandatory` findings participate in gates. A `draft` policy is not evaluated; an `active` policy is eligible. Policies can also include rationale, narrative, domain, owner, scope and tags. Long text such as `narrative` can use a `"""` triple-quoted multiline string. `tags` is a list of strings, for example `tags = ["soc2", "hipaa"]`, the same syntax as tags on any other workspace object; there is no separate framework/mapping concept, a tag is simply how a customer labels a framework. Each rule selects a built-in check and supplies literal parameters. A rule may also carry its own `title`, a `severity` that overrides the policy's for that rule, and a `remediation` sentence that is echoed with the rule's findings. Free-form policy `scope` describes intent; actual check selection is determined by the check's parameters.

## Authoring workflow

1. Read the branch's existing policies and the instance's check catalogue. The catalogue is the only source of truth for what each check reports, which object kinds it inspects and the exact parameters it accepts.
2. Write one `policy KEY { ... }` document in `policies/KEY.xs`. Customize its key, statement and rules; do not keep a template association.
3. Validate and format through the native `POST /api:meta/workspace/{id}/policy/parse` endpoint with `{source}`. The result contains `{policy, source}` and writes nothing. With the authenticated Xano MCP, use its policy parse tool.
4. Save canonical source using `POST /policy` or `PUT /policy/{id}` with `{branch, data: {source}}`. Do not combine source with structured fields. The server owns version increments.
5. Evaluate the same branch and inspect its findings. Runs made before edits are historical evidence, not current approval.

Policies also travel in the platform's workspace multidoc import/export. Use the official CLI's `workspace pull` and `workspace push` flow for a local workspace. The authenticated MCP supports workspace exports and one-time upload URLs for large multidocs; upload processes the source on the instance. A mandatory finding reported after a push does not roll back that import. Merge uses fresh evaluation.

## Check catalogue

A rule selects one built-in check and supplies literal parameters. Unknown check IDs and parameter names are rejected when saving. Read the instance catalogue (`GET /api:meta/workspace/{id}/policy/check` or `xano policy catalogue -o json`) for current types, defaults, allowed values, nested properties and examples.

In the table, `name*` is required. `1 of (a, b)` requires at least one non-empty value or enabled boolean; each member is individually optional. Every check also accepts the shared scope parameters below.

| Check | Behavior | Parameters |
| --- | --- | --- |
| `db.where_constraint_required` | Requires db.query and db.get reads to include a predicate on the selected field. If compare_to is set, that same predicate must reference it. Checks nested condition groups syntactically; it does not prove the condition holds on every Boolean path. | `table_selector`, `field*`, `compare_to` |
| `literal.credential_shape` | Reports known credential-shaped string literals in selected locations. Scanning function stacks also reports literal encryption keys and IVs, regardless of the selected patterns. Findings include locations and pattern names, never secret values. | `patterns`, `locations` |
| `object.settings_forbidden` | Reports objects whose saved settings match all configured predicates. Checks stored values; inherited runtime settings are not resolved. | `object_kind*`, `when*` |
| `outbound.vendor_allowlist` | Reports unapproved HTTP hosts, cloud and email providers, and agent model providers. Empty allowlists report destinations as not yet reviewed. Dynamic or missing destinations are reported as unresolved; environment secrets are not read. | `kinds`, `hosts`, `providers` |
| `query.auth_required` | Requires each query to declare an auth table or carry the public exception tag. Checks the saved authentication setting; authorization logic is not evaluated. | `public_tag` |
| `query.input_rules` | Checks declared query inputs for required types, filters, limits, usage and names. Enable at least one condition. Filter requirements apply to text inputs; types come from declarations. | 1 of (`type_by_name`, `filters_required`, `paging_max_required`, `path_params_forbidden`, `unused_forbidden`, `inputs_required`, `filter_min`) |
| `query.middleware_required` | Requires every named middleware to be attached and active. Resolves query, API group and branch or workspace defaults for pre- and post-middleware. Checks attachment, not middleware behavior. | `middleware*` |
| `query.statement_required` | Requires a matching statement or function call in the query's own stack, optionally first or containing specified references. Confirms presence in the definition, not execution on every path. | 1 of (`statement`, `function`), `position`, `must_reference`, `when` |
| `query.tagged_table_access` | Requires queries reaching tagged tables to declare authentication and, optionally, call a named function. Table access through called functions counts; addons are optional. The required function call must be in the query's own stack. Only queries reaching a tagged table count as checked. | `follow_addons`, `tag*`, `auth`, `function` |
| `query.workflow_test_coverage` | Requires each query to be called by api.call in a workflow test on the branch. Checks test definitions without running tests or checking assertions. Use scope to select the queries that need coverage. | _scope only_ |
| `stack.statement_forbidden` | Reports listed statements anywhere in an object's function stack, including nested branches and loops. | `statements*` |
| `stack.statement_order` | Requires a matching before statement ahead of the first matching after statement in the top-level stack. Nested statements and called functions are not followed. Objects with no after statement pass. | `before*`, `after*` |
| `statement.containment` | Requires or forbids enclosing blocks, or requires nested statements. Checks every nesting depth and branch; the matching block need not execute on every path. | 1 of (`must_be_inside`, `must_not_be_inside`, `must_contain`), `statement*`, `min_count` |
| `statement.expression_rule` | Checks a parameter for required or forbidden references, literals, operators and filters. An omitted parameter is reported. References are inspected as written; intermediate variables are not traced. | `statement*`, `param*`, `must_reference`, `must_not_reference`, `operators_forbidden`, `literals_forbidden`, `filters_forbidden`, `filters_required` |
| `statement.param_bound` | Requires a numeric literal within the inclusive bounds. Reports missing, non-numeric and unresolved values. Bounds use the parameter's native units. | 1 of (`min`, `max`), `statement*`, `param*`, `unit` |
| `statement.param_forbidden` | Reports a parameter set to a forbidden literal value, or a computed value that cannot be resolved. An omitted parameter passes. | `statement*`, `param*`, `values*` |
| `statement.param_not_from_input` | Reports whole-record assignments from $input, $input.new or $input.old, and protected fields assigned directly from request input. Intermediate variables are not traced. | `statement*`, `param`, `fields` |
| `statement.param_required` | Requires an explicit parameter on matching statements. For output, requires a customized field list and can also check for fields marked sensitive in the table schema. | `statement*`, `param*`, `when_table_tag`, `follow_addons`, `must_exclude_sensitive_fields` |
| `table.auth_table_rules` | Requires exactly one auth-enabled table across the branch. Queries that declare authentication must use that table. Scope narrows the checked objects and queries; the table count always covers the full branch. | _scope only_ |
| `table.coverage_required` | Requires each selected table to be referenced by a matching object, directly or through called functions. Scope selects tables; referenced_by selects the objects that provide coverage. Only tables count as checked. | `table_selector`, `referenced_by` |
| `table.field_attribute_required` | Checks selected schema fields for a required attribute, type or presence, or forbids them. When names and types are both set, a field must match both. Reads schema definitions only. | 1 of (`field_names`, `field_types`), `attribute`, `value`, `type`, `require_exists`, `forbidden` |
| `table.tag_required` | Requires a table tag when a schema field matches both the selected type and one of the selected names. Reads schema definitions only. Only tables with a matching field count as checked. | `field_type`, `field_names*`, `tag*` |
| `table.view_hide_required` | Requires saved table views to hide every field marked sensitive in the table schema. Checks each view's hidden-column list. Tables without saved views pass. | `table_tag` |
| `table.write_location_restricted` | Restricts writes to a table to approved functions or tagged objects. Checks where each write is defined; a caller can use an approved function without defining the write itself. | `table*`, `fields`, `statements`, `allowed_functions`, `allowed_tags` |
| `test.assertion_required` | Requires a workflow test that calls each selected query anonymously and asserts an authorization rejection (401, 403, unauthorized or forbidden). Recognizes a call expectation, an enclosing expect.to_throw, or a later assertion on the call's result. Tests are inspected, not run. | `scenario` |
| `trigger.self_write_forbidden` | Reports database triggers that write to their own table, including bulk writes and add-or-edit. Inspects the trigger's own stack, including nested branches; writes inside called functions are not followed. | _scope only_ |
| `workspace.object_required` | Requires a minimum count of objects matching the selected kind, name, tag and scope. Checks object presence, not behavior. | `object_kind*`, `tag`, `name`, `min_count` |

Closed value sets worth knowing without a catalogue round-trip:

- `literal.credential_shape.patterns`: `stripe`, `aws`, `github`, `pem`, `url_credentials`
- `literal.credential_shape.locations`: `run`, `env`, `agent_settings`
- `object.settings_forbidden.object_kind`: `table`, `query`, `function`, `workflow_test`, `api_group`, `task`, `trigger`, `middleware`, `addon`, `channel`, `tool`, `agent`, `mcp_server`, `workspace`
- `outbound.vendor_allowlist.kinds`: `api.request`, `cloud`, `email`, `agent.llm`
- `query.statement_required.position`: `any`, `first`
- `statement.expression_rule.operators_forbidden`: `===`, `!==`, `==`, `!=`, `>=`, `<=`, `&&`, `||`, `~`, `+`, `-`, `*`, `/`, `%`, `<`, `>`
- `test.assertion_required.scenario`: `anonymous_call_rejected`
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

- `scope.object_kinds` (string[]) — Include these kinds from those supported by the check.
- `scope.api_groups` (string[]) — Queries in these API groups, matched by exact display name or canonical name.
- `scope.verbs` (string[]) — Queries with these HTTP verbs, matched case-insensitively.
- `scope.auth` (string) — Queries only: none selects queries without an auth table; required selects queries declaring one. Empty adds no restriction.
- `scope.tags` (string[]) — Include objects carrying any listed exact tag. Uses the object's own tags, not the tags of tables it reads.
- `scope.except_tags` (string[]) — Exclude objects carrying any listed exact tag. Combined with top-level except_tags.
- `scope.tables` (string[]) — Select tables by exact name, or objects reaching any named table directly or through called functions.
- `scope.reaching_table_tag` (string) — Select objects reaching a table with this exact tag, directly or through called functions.

Non-empty top-level `api_groups`, `tables` and `verbs` replace the corresponding `scope` values. Top-level and nested `except_tags` combine. API group, HTTP verb and auth filters select queries only and exclude other object kinds.

Example: `params = { statements: ["db.add", "db.edit"], scope: { object_kinds: ["query"], verbs: ["GET"] }, except_tags: ["generated"] }`.

## Writing parameter values

- **Types:** `string[]` is a list of strings; `bool` requires true or false. `number` accepts finite numeric literals, not numeric strings. Both `min_count` parameters are `integer` with minimum 1. Bounds are inclusive and use the checked parameter's native units; `unit` only labels findings.
- **Object values:** use objects such as `{}` for selectors and maps. The catalogue publishes object defaults as `{}`. `value` in `table.field_attribute_required` accepts any literal, including null.
- **Statement names:** use an exact XanoScript name such as `db.add` or `api.request`; stored aliases such as `mvp:dbo_add` also work. A misspelled name matches nothing, so verify it against statement documentation.
- **Parameter paths:** use a name or dotted path such as `data.role`. Aliases include `per_page` for paging size, `where` for search conditions and `error` for the error message.
- **References:** match a reference or its child paths. `$auth` matches `$auth.id`; `$input.id` does not match `$input.id2`. Supported roots are `$input`, `$auth`, `$env`, `$var`, `$error` and `$output`. Quoted text is literal.
- **Literal comparison:** false differs from "false", and 0 differs from "0". Equal numbers match, including 1 and 1.0. Empty objects and lists share a stored representation and compare equally. This applies to forbidden literals, field attributes and setting equality.
- **Names:** table, function, middleware, tag, field and provider names match exactly. Hosts and HTTP verbs ignore case. Regex and wildcards are not supported; credential `patterns` selects built-in shapes.
- **Combined conditions:** field names and field types must match the same field; table selectors combine all conditions. Allowed write functions and tags are alternatives. `query.input_rules` needs an enabled condition and `statement.containment` needs a structural constraint. `statement.expression_rule` without extra constraints still requires the parameter to exist.
- **Tags:** `scope.tags` and `except_tags` match the inspected object's own tags. `query.tagged_table_access.tag` and `table_selector.tag` match table tags.

## Findings and remediation

A finding carries `policy_key`, `policy_title`, `rule_id`, `rule_title`, `severity`, an `object` reference, a `message` saying what was found and where in the stack, and `remediation` — the rule author's own text when set, otherwise a deterministic per-check instruction derived from the rule's parameters and the object. `remediation` is always present, so a fix agent can act on a finding without re-deriving the intent.

A rule that inspected nothing reports `0 checked` rather than a pass, which is how "the scope matched no objects" is told apart from "everything satisfied the rule".

## Validation and access

The standalone developer MCP's bundled language server does not validate policy syntax. It must not report these files as successfully validated. Use native policy parsing; do not rewrite a policy into another object type to satisfy the local validator.

Read, parse and evaluate need `workspace:policy` read access. Writes additionally need the matching operation scope and an admin/explore role. Existing tokens may need reissuing. The authenticated MCP takes instance and workspace from its request authentication; it does not accept arbitrary targets.

A policy is its description plus deterministic check rules. Checks inspect stored definitions and nothing runs at request time.

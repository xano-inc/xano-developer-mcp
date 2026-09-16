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

A rule names one check and supplies its literal parameters. Unknown check ids and unknown parameter names are refused when the policy is saved, so build only from this list and read the LIVE catalogue (`GET /api:meta/workspace/{id}/policy/check`, or `xano policy catalogue -o json`) for each parameter's full description, closed value set, nested shape and worked example.

Notation below: `name*` is REQUIRED (a rule without it is refused); `1 of (a, b)` means each is individually optional but a rule supplying neither is refused; everything else is optional and falls back to the default published in the catalogue. Every check additionally accepts the five shared scope parameters documented under "Scoping a rule".

| Check | Reports | Parameters |
| --- | --- | --- |
| `db.where_constraint_required` | Reports a read of a selected table that does not constrain the given field in its where clause, optionally against a given reference. | `table_selector`, `field*`, `compare_to` |
| `literal.credential_shape` | Reports string literals that match a known credential shape, and a literal key or iv on security.encrypt (always, whatever patterns is set to). | `patterns`, `locations` |
| `object.settings_forbidden` | Reports objects of one inventory kind whose stored settings match EVERY predicate in when. | `object_kind*`, `when*` |
| `outbound.vendor_allowlist` | Lists every outbound destination written into the definitions and reports the ones that are not on the allowlist: literal api.request hosts, cloud and email providers, and agent model providers. | `kinds`, `hosts`, `providers` |
| `query.auth_required` | Reports an in-scope query that declares no auth table and does not carry the tag that marks it deliberately public. | `public_tag` |
| `query.input_rules` | Reports declared-input problems on an in-scope query: an input whose declared type is wrong, a text input missing a required filter or minimum, an input that is never referenced, an input driving per_page without a literal max filter, a required input that is absent, and a forbidden path parameter. | `type_by_name`, `filters_required`, `paging_max_required`, `path_params_forbidden`, `unused_forbidden`, `inputs_required`, `filter_min` |
| `query.middleware_required` | Reports an in-scope query that does not have every named middleware attached and active. | `middleware*` |
| `query.statement_required` | Reports an in-scope query whose stack does not contain a matching statement, optionally a call to a named function, optionally carrying given references, and optionally as the very first top-level statement. | 1 of (`statement`, `function`), `position`, `must_reference`, `when` |
| `query.tagged_table_access` | Reports an in-scope query that reaches a table carrying the given tag but does not declare the given auth table, or does not call the given function. | `follow_addons`, `tag*`, `auth`, `function` |
| `query.workflow_test_coverage` | Reports an in-scope query that no workflow test on the branch calls. | _scope only_ |
| `stack.statement_forbidden` | Reports every use of a listed statement anywhere in an object's function stack, including inside conditional, loop, try/catch and switch branches. | `statements*` |
| `stack.statement_order` | Reports an object whose first matching "after" statement is not preceded by a matching "before" statement. | `before*`, `after*` |
| `statement.containment` | Reports the inspected statement when it is not inside a required block, when it is inside a forbidden block, or when it does not contain enough of the required nested statements. | `statement*`, `must_be_inside`, `must_not_be_inside`, `must_contain`, `min_count` |
| `statement.expression_rule` | Inspects one parameter's expression as written and reports a missing required reference or filter, or a forbidden reference, operator, literal or filter. | `statement*`, `param*`, `must_reference`, `must_not_reference`, `operators_forbidden`, `literals_forbidden`, `filters_forbidden`, `filters_required` |
| `statement.param_bound` | Reports a numeric literal parameter that falls outside the inclusive bounds. | 1 of (`min`, `max`), `statement*`, `param*`, `unit` |
| `statement.param_forbidden` | Reports a statement whose named parameter is set to one of the forbidden literal values. | `statement*`, `param*`, `values*` |
| `statement.param_not_from_input` | Reports two shapes on the inspected statement: an object parameter assigned wholesale from request input (the bare $input, $input.new or $input.old), and any of the protected fields assigned from anything under $input. | `statement*`, `param`, `fields` |
| `statement.param_required` | Reports a statement that leaves a parameter unset, optionally only when the statement touches a table carrying a given tag. | `statement*`, `param*`, `when_table_tag`, `follow_addons`, `must_exclude_sensitive_fields` |
| `table.auth_table_rules` | Reports a workspace that does not have exactly one auth-enabled table, and every in-scope query whose auth declaration names a different table. | _scope only_ |
| `table.coverage_required` | Reports each selected table that no matching object references. | `table_selector`, `referenced_by` |
| `table.field_attribute_required` | Selects schema fields by name and/or type and then reports them: a selected field that is missing the required attribute value, one whose type is wrong, a required field name that is absent, or — with forbidden — every field that matched at all. | 1 of (`field_names`, `field_types`), `attribute`, `value`, `type`, `require_exists`, `forbidden` |
| `table.tag_required` | Reports an in-scope table that has a schema field matching BOTH field_type and one of field_names but does not carry the given tag. | `field_type`, `field_names*`, `tag*` |
| `table.view_hide_required` | Reports a saved table view that leaves a sensitive field visible. | `table_tag` |
| `table.write_location_restricted` | Reports a write to the named table that is not located inside an approved function and not made by an object carrying an approved tag. | `table*`, `fields`, `statements`, `allowed_functions`, `allowed_tags` |
| `test.assertion_required` | Reports an in-scope query that no workflow test calls anonymously while asserting an authorization rejection. | `scenario` |
| `trigger.self_write_forbidden` | Reports a database table trigger whose own stack writes to the table it is attached to (db.add, db.edit, db.patch, db.del, db.bulk.delete or db.truncate). | _scope only_ |
| `workspace.object_required` | Counts the objects of one inventory kind that match the given name and/or tag and reports the workspace when there are fewer than min_count. | `object_kind*`, `tag`, `name`, `min_count` |

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

Every check carries the same five scope parameters. They narrow WHICH objects the rule inspects and never change what the check looks for. All conditions AND together; an omitted or empty one adds no restriction.

- `scope.object_kinds` (string[]) — Keep only these inventory kinds, out of the kinds the check already inspects. One of `table`, `query`, `function`, `workflow_test`, `api_group`, `task`, `trigger`, `middleware`, `addon`, `channel`, `tool`, `agent`, `mcp_server`, `workspace`.
- `scope.api_groups` (string[]) — Queries only. Keep queries in these API groups, matched against the group's display NAME or its canonical name.
- `scope.verbs` (string[]) — Queries only. Keep queries with these HTTP verbs; compared case-insensitively.
- `scope.auth` (string) — Queries only. "none" keeps only queries that declare no auth table, "required" keeps only those that declare one. One of `""`, `none`, `required`.
- `scope.tags` (string[]) — Keep objects carrying at least one of these tags. These are the tags ON the inspected object (a query's tags, a table's tags, ...), never the tags of tables it reads.
- `scope.except_tags` (string[]) — Drop objects carrying any of these tags. Same tag source as tags.
- `scope.tables` (string[]) — On a table check, keep tables with these names. On a stack check, keep objects that reach one of these tables directly or through a called function.
- `scope.reaching_table_tag` (string) — Keep objects whose reachable tables (directly or through called functions) include a table carrying this tag.

`api_groups`, `tables`, `verbs` and `except_tags` may also be written at the top level of `params` as shorthands for the matching `scope` key. `scope.api_groups`, `scope.verbs` and `scope.auth` describe QUERIES: setting any of them on a check that inspects several kinds drops every non-query object from the rule.

Example: `params = { statements: ["db.add", "db.edit"], scope: { object_kinds: ["query"], verbs: ["GET"] }, except_tags: ["generated"] }`.

## Writing parameter values

These rules apply wherever a check takes a statement name, a parameter name, a reference or a literal.

- **Statement names** are XanoScript names: `db.add`, `db.edit`, `db.patch`, `db.del`, `db.query`, `db.get`, `db.truncate`, `db.direct_query`, `db.bulk.delete`, `api.request`, `function.run`, `util.send_email`, `util.get_all_input`, `security.encrypt`, `security.create_auth_token`, `debug.log`, `precondition`, `throw`, `try_catch`, `conditional`, `foreach`, `while`, `for`, `switch`, `group`, `var`, `expect.to_throw`. The stored `mvp:*` name is accepted too. A name that matches no statement never matches anything and is NOT reported as an error, so verify the spelling against the statement docs.
- **Parameter names** are resolved on the statement in this order: its `context`/`params`/`process` block, then its named input assignments, then the statement node itself. A dotted path reaches into an object field (`data.role`). Three aliases are understood: `per_page` (db.query `return.list.paging.per_page`), `where` (`search`) and `error` (`message`).
- **References** (`must_reference`, `must_not_reference`, `compare_to`, `before.must_reference`) match exactly or by prefix, so `$auth` also matches `$auth.id`. The roots that can appear are `$input`, `$auth`, `$env`, `$var`, `$error`, `$output`. Text inside quotes is a literal, not a reference.
- **Literal lists** (`values`, `literals_forbidden`) compare with exact type: `[false]` matches the boolean `false` but not the string `"false"`, and `[0]` does not match `"0"`.
- **Names are matched exactly.** There are no wildcards or regular expressions anywhere — not on `hosts`, `api_groups`, `tables` or `field_names`. `literal.credential_shape.patterns` is a closed set of named shapes, not a pattern you write.
- **Tags**: `scope.tags` / `except_tags` match the tags ON the inspected object. `query.tagged_table_access.tag` and `table_selector.tag` match TABLE tags instead.

## Findings and remediation

A finding carries `policy_key`, `policy_title`, `rule_id`, `rule_title`, `severity`, an `object` reference, a `message` saying what was found and where in the stack, and `remediation` — the rule author's own text when set, otherwise a deterministic per-check instruction derived from the rule's parameters and the object. `remediation` is always present, so a fix agent can act on a finding without re-deriving the intent.

A rule that inspected nothing reports `0 checked` rather than a pass, which is how "the scope matched no objects" is told apart from "everything satisfied the rule".

## Validation and access

The standalone developer MCP's bundled language server does not validate policy syntax. It must not report these files as successfully validated. Use native policy parsing; do not rewrite a policy into another object type to satisfy the local validator.

Read, parse and evaluate need `workspace:policy` read access. Writes additionally need the matching operation scope and an admin/explore role. Existing tokens may need reissuing. The authenticated MCP takes instance and workspace from its request authentication; it does not accept arbitrary targets.

A policy is its description plus deterministic check rules. Checks inspect stored definitions and nothing runs at request time.

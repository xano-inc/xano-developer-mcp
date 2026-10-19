# Policy templates

The platform's starting points for a new policy, and its recipes for goals that take several, from the check catalogue this documentation was generated from. The instance's own catalogue is authoritative and can differ by platform version: `GET /api:meta/workspace/{id}/policy/check` serves it as `templates`, `recipes` and `not_checkable`, `xano policy catalogue` prints it, and the Xano MCP's `xano_list_policy_checks` returns it with `detail: "full"`. The `policies` topic describes each template field.

## Using a template

- **Prefer a template.** Before writing a new policy, look for a template that covers the request, and when one fits, start from it rather than inventing a key and rules: use its key (with a free `-2`, `-3`… suffix when the branch already has that key), its title, its summary as the `statement`, its severity and its rules, and keep `mode = "advisory"`. Then change only what the request asks for. When a recipe covers the goal, follow it (see Recipes): it names the objects to build, the templates to create, in order, and the rules to add.
- **Fill every need.** "Fill" names the parameter paths each rule leaves empty: every one is required, except that of a group joined by "or" one is enough (`functions`, and `tags` or `paths`). A path with a dot names a property of an object parameter (`referenced_by.max_age_days`, filled inside `referenced_by`). The example shows a value that fits: the template's own, else the check's catalogue example. It is a hint, never a value to copy, so fill each need with the workspace's own names.
- **Checks** names the checks the template's rules use; read a check's parameters, and the goals each one serves, in the `policies` topic's check catalogue.
- **Frameworks** names the framework tags a template carries, a second way to find it. Framework tags point to templates on related topics. They don't make a workspace compliant, and Xano doesn't track changes to these frameworks.
- With the CLI, `xano policy create --template <id>` creates the policy from the instance's template.

## Access control

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `endpoints_need_login` | `AUTH-010` | critical | Endpoints require login | `object.auth_required` | _nothing_ | SOC 2, HIPAA |
| `own_records_only` | `AUTH-020` | critical | Users only reach their own records | `db.where_constraint_required`, `db.write_from_input_forbidden` | R1: `field` (e.g. `"user_id"`); R2: `fields` (e.g. `["user_id"]`) | SOC 2, HIPAA |
| `no_self_promotion` | `AUTH-030` | critical | Users can't make themselves admin | `db.write_from_input_forbidden` | _nothing_ | SOC 2, HIPAA |
| `public_endpoints_harmless` | `AUTH-003` | high | Public endpoints can't change data | `stack.statement_forbidden` | _nothing_ |  |
| `admin_endpoints_check_role` | `AUTH-002` | critical | Admin endpoints check the caller's role | `object.statement_required` | `functions` (e.g. `["require_admin"]`), and `tags` (e.g. `["admin"]`) or `paths` (e.g. `["admin"]`) | SOC 2, HIPAA |
| `tokens_expire` | `SEC-014` | high | Login tokens expire within an hour | `statement.param_bound` | R2: `max` (e.g. `3600`) | SOC 2, HIPAA |
| `writes_check_first` | `BIZ-001` | high | Endpoints check the caller before writing | `stack.statement_order` | _nothing_ |  |
| `protected_endpoints_run_middleware` | `AUTH-040` | high | Protected endpoints run your auth middleware | `object.middleware_required` | `middleware` (e.g. `["access_context"]`) |  |
| `one_auth_table` | `AUTH-050` | medium | Users sign in through one auth table | `table.auth_table_rules` | _nothing_ |  |

## Data protection

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `no_pii_in_responses` | `DATA-010` | high | Endpoints don't return personal data | `db.output_fields_forbidden` | `fields` (e.g. `["ssn","user.password_hash"]`) | SOC 2, HIPAA, GDPR, PCI DSS |
| `sensitive_tables_need_login` | `CONF-010` | critical | Sensitive tables are only reached by logged-in endpoints | `object.tagged_table_access` | `table_tags` (e.g. `["phi"]`) | SOC 2, HIPAA, GDPR |
| `sensitive_fields_marked` | `CONF-011` | high | Sensitive fields are marked sensitive | `table.field_attribute_required` | `field_names` (e.g. `["ssn","dob"]`) | SOC 2, HIPAA, GDPR, PCI DSS |
| `confidential_tables_tagged` | `CONF-012` | medium | Tables holding confidential data are tagged | `table.tag_required` | `field_names` (e.g. `["notes","diagnosis"]`) |  |
| `views_hide_sensitive` | `CONF-013` | medium | Saved views hide sensitive fields | `table.view_hide_required` | _nothing_ | SOC 2, HIPAA |
| `no_sensitive_data_in_logs` | `LOG-001` | high | Logs don't contain request, user or secret data | `statement.expression_rule` | _nothing_ | SOC 2, HIPAA, GDPR, PCI DSS |
| `audit_log_protected` | `RET-001` | high | Only the audit function writes the audit log | `workspace.object_required`, `table.write_location_restricted` | R1: `names` (e.g. `["audit_log"]`); R2: `restricted_tables` (e.g. `["audit_log"]`), `allowed_functions` (e.g. `["record_audit_event"]`) | SOC 2, HIPAA |
| `retained_data_cleaned_up` | `RET-002` | medium | Retained data has a cleanup task | `table.coverage_required` | `tags` (e.g. `["retained"]`) | SOC 2, GDPR |
| `retained_data_has_age_limit` | `RET-003` | medium | Retained data is deleted after a set number of days | `table.coverage_required` | `tags` (e.g. `["retained"]`), `referenced_by.max_age_days` (e.g. `730`) | SOC 2, GDPR |

## Secrets

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `no_secrets_in_code` | `SEC-012` | critical | No secrets are hardcoded | `literal.credential_shape` | _nothing_ | SOC 2, PCI DSS |

## Integrations

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `approved_vendors_only` | `VND-001` | high | Data only goes to approved vendors | `outbound.vendor_allowlist` | `hosts` (e.g. `["api.stripe.com",".example.com"]`) or `providers` (e.g. `["aws","openai"]`) | SOC 2, HIPAA, GDPR, PCI DSS |
| `tls_verification_on` | `SEC-011` | high | External requests verify TLS certificates | `statement.param_forbidden` | _nothing_ | SOC 2, HIPAA, PCI DSS |
| `external_calls_handle_errors` | `LOG-010` | medium | External calls handle their own failures | `statement.containment` | _nothing_ |  |
| `requests_have_timeout` | `SEC-013` | medium | External requests time out quickly | `statement.param_bound` | _nothing_ |  |
| `agents_use_approved_tools` | `AI-001` | high | AI agents use only approved tools | `agent.tool_allowlist` | `tools` (e.g. `["lookup_order"]`) or `tool_tags` (e.g. `["agent-approved"]`) |  |

## Reliability

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `no_destructive_sql` | `SEC-010` | high | No table truncation or raw SQL | `stack.statement_forbidden` | _nothing_ |  |
| `middleware_surfaces_errors` | `LOG-011` | medium | Middleware doesn't swallow errors | `object.settings_forbidden` | _nothing_ |  |
| `reads_are_paged` | `PERF-001` | medium | Endpoints never return every row | `statement.param_bound` | _nothing_ |  |
| `get_endpoints_only_read` | `API-010` | medium | GET endpoints only read | `stack.statement_forbidden` | _nothing_ |  |
| `inputs_validated` | `VAL-001` | medium | Endpoint inputs are typed and bounded | `object.input_rules`, `object.unused_input_forbidden` | _nothing_ |  |
| `triggers_write_elsewhere` | `RET-010` | medium | Trigger writes don't silently skip other triggers or re-fire themselves | `trigger.write_trigger_effects` | _nothing_ |  |

## Testing

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `endpoints_have_tests` | `CHG-001` | low | Endpoints are tested | `object.test_coverage`, `test.assertion_required` | _nothing_ | SOC 2 |

## Conventions

| Template | Key | Severity | Title | Checks | Fill | Frameworks |
| --- | --- | --- | --- | --- | --- | --- |
| `functions_snake_case` | `CONV-010` | low | Functions are snake_case | `object.naming` | _nothing_ |  |
| `fields_snake_case` | `CONV-011` | low | Fields are snake_case with <table>_id links | `object.naming` | _nothing_ |  |
| `endpoint_paths_versioned` | `CONV-012` | low | Endpoint paths are versioned kebab-case | `object.naming` | _nothing_ |  |
| `function_arguments_snake_case` | `CONV-013` | low | Function arguments are snake_case | `object.naming` | _nothing_ |  |
| `agreed_tag_vocabulary` | `CONV-020` | low | Tags come from the agreed vocabulary | `object.tag_vocabulary` | `allowed_tags` (e.g. `["pii","phi","pci","public"]`) |  |
| `tags_kebab_case` | `CONV-021` | low | Tags are kebab-case | `object.tag_vocabulary` | _nothing_ |  |
| `owner_team_tagged` | `CONV-022` | low | APIs, functions and tasks name an owner team | `object.tag_required` | `tag_set` (e.g. `["team-billing","team-growth","team-platform"]`) |  |
| `tables_classified` | `CONV-023` | low | Every table is classified | `object.tag_required` | `tag_set` (e.g. `["public","internal","confidential","restricted"]`) |  |
| `ai_tools_described` | `CONV-030` | low | AI tools and their inputs are described | `object.description_required` | _nothing_ |  |
| `endpoints_stay_short` | `CONV-040` | low | Endpoints and functions stay short | `stack.size_limit` | _nothing_ |  |
| `shallow_nesting` | `CONV-041` | low | Stacks nest at most 3 levels deep | `stack.size_limit` | _nothing_ |  |
| `no_leftover_code` | `CONV-050` | low | No leftover code | `stack.disabled_statement_forbidden`, `object.unused_input_forbidden`, `stack.unused_variable_forbidden` | _nothing_ |  |
| `tables_have_listed_fields` | `CONV-060` | low | Every table has the listed fields | `table.field_attribute_required` | `field_names` (e.g. `["updated_at","tenant_id"]`) |  |

## Recipes

A recipe covers a goal that takes several templates, such as protecting payment card data. Most goals have three parts, and a recipe names each: the enforcement (the objects that do the work at run time, under Build), the coverage (the templates and rules that keep it wired in everywhere) and the gap (what no rule in it can see). Nothing creates a recipe. Show the user one plan: the objects to build and the changes to existing ones, each with the workspace's own names, the policies (each template as its own policy, in the order given, then the recipe's own rules together in one policy of your own) and what stays unchecked. After one yes, build all of it in the same change, objects before the policies that name them. A fill names the rule param an object's name goes in: `<template id>.<param>` for a template's rule, `rules[<n>].<param>` for the recipe's own rule n (from 0). Say so when the request reaches into the gap. The catalogue serves them as `recipes`.

Framework tags point to templates on related topics. They don't make a workspace compliant, and Xano doesn't track changes to these frameworks.

### Protect health data

`protect_health_data` · HIPAA. Tables holding health data are tagged and marked, reached only by logged-in callers who record each access, kept out of responses, logs and saved views, and sent only to approved vendors over verified TLS.

Keywords: health, phi, ephi, patient, medical, clinical, diagnosis, hipaa, healthcare.

Build (the enforcement the rules point at):

- **tag** `phi`: Added to every table holding health data and to no other: CONF-012 requires it on a table with a health field, CONF-010 a login on whatever reaches such a table, and the access-record rule selects by it. Fills `confidential_tables_tagged.tag`, `sensitive_tables_need_login.table_tags`, `rules[0].reaching_table_tags`.
- **field_attribute** `sensitive`: Set on each health field (diagnosis, dob, ssn), as CONF-011 requires; DATA-010 and CONF-013 then keep those fields out of responses and saved views.
- **table** `phi_access_log`: One row per access to a health record: who ($auth.id), which record and when. RET-001 requires it and lets only log_phi_access write it. Fills `audit_log_protected.names`, `audit_log_protected.restricted_tables`.
- **function** `log_phi_access`: Takes the record read and adds a phi_access_log row with db.add, the user from $auth. Every endpoint, tool and task reaching a phi table calls it unconditionally (the access-record rule). Fills `rules[0].functions`, `audit_log_protected.allowed_functions`.

The user's own objects and choices fill `confidential_tables_tagged.field_names`, `sensitive_fields_marked.field_names`, `no_pii_in_responses.fields`, `approved_vendors_only.hosts`, `approved_vendors_only.providers`.

Templates, in order, one policy each:

1. `confidential_tables_tagged` (`CONF-012`): Tables holding confidential data are tagged
2. `sensitive_fields_marked` (`CONF-011`): Sensitive fields are marked sensitive
3. `sensitive_tables_need_login` (`CONF-010`): Sensitive tables are only reached by logged-in endpoints
4. `no_pii_in_responses` (`DATA-010`): Endpoints don't return personal data
5. `no_sensitive_data_in_logs` (`LOG-001`): Logs don't contain request, user or secret data
6. `views_hide_sensitive` (`CONF-013`): Saved views hide sensitive fields
7. `approved_vendors_only` (`VND-001`): Data only goes to approved vendors
8. `tls_verification_on` (`SEC-011`): External requests verify TLS certificates
9. `audit_log_protected` (`RET-001`): Only the audit function writes the audit log

Rules no template covers, together in one policy of your own:

- `rules[0]` Objects reaching health tables always record the access: `object.statement_required` with `{"placement":"unconditional"}`. Fill `functions`, `reaching_table_tags`.

No rule here can see: People and training; Access reviews and change approvals; Runtime data and copies between environments; Infrastructure and network (see What no check can see).

### Protect payment card data

`protect_card_data` · PCI DSS. No table stores a card number or security code, card details go only to your payment processor over verified TLS, and its keys, your logs and your responses keep card data out of sight.

Keywords: card, credit card, payment, pan, cvv, cardholder, pci, checkout, stripe, tokenization.

Build (the enforcement the rules point at):

- **function** `charge_card`: Charges through the payment processor with api.request, using the processor's card token and its key from $env, and stores only the token and card_last4. VND-001 holds it to the processor's hosts, SEC-012 finds no key in code, and the card-field rule no card number in any table.
- **field_attribute** `sensitive`: Set on the card-adjacent fields you keep (card_last4, billing_address), as CONF-011 requires; DATA-010 then keeps them out of responses.

The user's own objects and choices fill `approved_vendors_only.hosts`, `approved_vendors_only.providers`, `sensitive_fields_marked.field_names`, `no_pii_in_responses.fields`.

Templates, in order, one policy each:

1. `no_secrets_in_code` (`SEC-012`): No secrets are hardcoded
2. `approved_vendors_only` (`VND-001`): Data only goes to approved vendors
3. `tls_verification_on` (`SEC-011`): External requests verify TLS certificates
4. `sensitive_fields_marked` (`CONF-011`): Sensitive fields are marked sensitive
5. `no_pii_in_responses` (`DATA-010`): Endpoints don't return personal data
6. `no_sensitive_data_in_logs` (`LOG-001`): Logs don't contain request, user or secret data

Rules no template covers, together in one policy of your own:

- `rules[0]` Card numbers and security codes are never stored: `table.field_attribute_required` with `{"field_names":["card_number","cvv","cvc","pan"],"forbidden":true}`.

No rule here can see: People and training; Access reviews and change approvals; Runtime data and copies between environments; Infrastructure and network (see What no check can see).

### Erase and expire personal data

`personal_data_erasure` · GDPR. Tables holding personal data are cleaned up on a schedule once their rows reach your retention period and reached by one function that erases a person's records, and personal fields stay marked and out of responses and logs.

Keywords: erasure, right to be forgotten, delete my data, retention, personal data, purge, dsar, privacy, gdpr, anonymise.

Build (the enforcement the rules point at):

- **function** `erase_user_data`: Deletes a person's records from every personal-data table with db.del or db.bulk.delete (add db.edit or db.patch to the erasure rule where a table is anonymised instead). The erasure rule requires it to reach each table tagged personal.
- **tag** `erasure`: Added to erase_user_data: the erasure rule counts only functions carrying it. Fills `rules[0].referenced_by.tags`.
- **endpoint** `account/erase`: A logged-in DELETE endpoint that calls erase_user_data for $auth.id, so a person can ask for erasure; no rule checks who calls the function.
- **tag** `personal`: Added to every table holding personal data: the erasure rule requires erase_user_data to reach each one. Fills `rules[0].tags`.
- **task** `purge_expired_records`: Runs on a repeating schedule and deletes each retained table's rows whose created_at is older than the retention period, with db.bulk.delete (or a query, a foreach and db.del) whose where compares created_at with now minus a literal number of days. RET-003 requires an active task deleting each table tagged retained at that age or younger, so the period is never read from an environment variable.
- **tag** `retained`: Added to every table whose records expire: RET-003 judges only tables carrying it. Fills `retained_data_has_age_limit.tags`.
- **field_attribute** `sensitive`: Set on each personal field, as CONF-011 requires; DATA-010 then keeps those fields out of responses.

The user's own objects and choices fill `retained_data_has_age_limit.referenced_by.max_age_days`, `sensitive_fields_marked.field_names`, `no_pii_in_responses.fields`.

Templates, in order, one policy each:

1. `retained_data_has_age_limit` (`RET-003`): Retained data is deleted after a set number of days
2. `sensitive_fields_marked` (`CONF-011`): Sensitive fields are marked sensitive
3. `no_pii_in_responses` (`DATA-010`): Endpoints don't return personal data
4. `no_sensitive_data_in_logs` (`LOG-001`): Logs don't contain request, user or secret data

Rules no template covers, together in one policy of your own:

- `rules[0]` The erasure function reaches every personal-data table: `table.coverage_required` with `{"referenced_by":{"object_kinds":["function"],"statements":["db.del","db.bulk.delete"]}}`. Fill `tags`, `referenced_by.tags`.

No rule here can see: Runtime data and copies between environments; People and training (see What no check can see).

### Keep code easy to review

`code_review_basics`. External calls handle their failures, endpoints are tested, endpoints and functions stay short and page their reads, no leftover code remains, and functions say what they do. Naming conventions are a separate choice: see the Conventions templates.

Keywords: code review, review, quality, clean code, maintainable, lint, best practice, tests, readable, error handling, breaking prod, juniors.

Build (the enforcement the rules point at):

- **tag** `legacy`: Added to large legacy endpoints and functions until they are split: CONV-040 skips them through except_tags. Fills `endpoints_stay_short.except_tags`.

Templates, in order, one policy each:

1. `external_calls_handle_errors` (`LOG-010`): External calls handle their own failures
2. `endpoints_have_tests` (`CHG-001`): Endpoints are tested
3. `endpoints_stay_short` (`CONV-040`): Endpoints and functions stay short
4. `no_leftover_code` (`CONV-050`): No leftover code
5. `reads_are_paged` (`PERF-001`): Endpoints never return every row

Rules no template covers, together in one policy of your own:

- `rules[0]` Functions say what they do: `object.description_required` with `{"object_kinds":["function"],"min_length":20}`.

No rule here can see: Access reviews and change approvals; People and training (see What no check can see).

### Record who changed what

`audit_changes` · SOC 2, HIPAA. Every edit and delete of the tables you name calls one audit function, only that function writes the audit log, and nothing edits or deletes an audit entry.

Keywords: audit, audit trail, who changed, change history, history, tamper, accountability, activity log, log changes.

Build (the enforcement the rules point at):

- **table** `audit_log`: One row per change: who ($auth.id), the table, the record, the action and when. RET-001 requires it and lets only record_audit_event write it, and the last rule keeps every entry from being edited or deleted. Fills `audit_log_protected.names`, `audit_log_protected.restricted_tables`, `rules[3].restricted_tables`.
- **function** `record_audit_event`: Takes the table, record id and action and adds an audit_log row with db.add, the user from $auth. Every edit, patch and delete of an audited table calls it unconditionally (the first three rules). Fills `audit_log_protected.allowed_functions`, `rules[0].functions`, `rules[1].functions`, `rules[2].functions`.

The user's own objects and choices fill `rules[0].when.tables`, `rules[1].when.tables`, `rules[2].when.tables`.

Templates, in order, one policy each:

1. `audit_log_protected` (`RET-001`): Only the audit function writes the audit log

Rules no template covers, together in one policy of your own:

- `rules[0]` Edits of audited tables call the audit function: `object.statement_required` with `{"placement":"unconditional","when":{"statement":"db.edit"}}`. Fill `functions`, `when.tables`.
- `rules[1]` Patches of audited tables call the audit function: `object.statement_required` with `{"placement":"unconditional","when":{"statement":"db.patch"}}`. Fill `functions`, `when.tables`.
- `rules[2]` Deletes from audited tables call the audit function: `object.statement_required` with `{"placement":"unconditional","when":{"statement":"db.del"}}`. Fill `functions`, `when.tables`.
- `rules[3]` Audit entries are never edited or deleted: `table.write_location_restricted` with `{"statements":["db.edit","db.patch","db.add_or_edit","db.del","db.truncate","db.bulk.update","db.bulk.patch","db.bulk.delete"]}`. Fill `restricted_tables`.

No rule here can see: Access reviews and change approvals; Runtime data and copies between environments (see What no check can see).

### Keep AI calls affordable and agents safe

`ai_cost_and_agent_safety`. AI calls stay out of loops, reads are paged, agents use approved model providers and enable only approved tools, AI tools are described and cannot delete records, and deletes and emails wait for an approval check.

Keywords: ai, llm, agent, cost, spend, tokens, mcp, tool, openai, anthropic, runaway, approval, human in the loop.

Build (the enforcement the rules point at):

- **table** `approvals`: Who asked for an action on which record, who approved it and when; require_approval reads it, and no rule checks the table itself.
- **function** `require_approval`: Looks up an approvals row for the action, approved by someone other than the requester, and stops with precondition when there is none. The approval rule requires a call to it before every delete and email. Fills `rules[2].before.functions`.
- **tag** `agent-approved`: Added to each tool the user approves for agents and MCP servers in the plan they say yes to: AI-001 accepts a tool carrying it, and reports any other tool an agent or server enables. Fills `agents_use_approved_tools.tool_tags`.

The user's own objects and choices fill `approved_vendors_only.hosts`, `approved_vendors_only.providers`, `agents_use_approved_tools.tools`.

Templates, in order, one policy each:

1. `approved_vendors_only` (`VND-001`): Data only goes to approved vendors
2. `agents_use_approved_tools` (`AI-001`): AI agents use only approved tools
3. `reads_are_paged` (`PERF-001`): Endpoints never return every row
4. `requests_have_timeout` (`SEC-013`): External requests time out quickly
5. `ai_tools_described` (`CONV-030`): AI tools and their inputs are described

Rules no template covers, together in one policy of your own:

- `rules[0]` AI calls are not made inside loops: `statement.containment` with `{"statements":["ai.agent.run","ai.external.mcp.tool.run"],"must_not_be_inside":["foreach","for","while"]}`.
- `rules[1]` AI tools cannot delete records: `stack.statement_forbidden` with `{"statements":["db.del","db.bulk.delete","db.truncate"],"object_kinds":["tool"]}`.
- `rules[2]` Deletes and emails wait for an approval check: `stack.statement_order` with `{"after":["db.del","db.bulk.delete","util.send_email"]}`. Fill `before.functions`.

No rule here can see: Spend caps; Task retries; Runtime data and copies between environments (see What no check can see).

### Limit how often endpoints can be called

`rate_limiting`. A rate-limit middleware runs before every public endpoint and every endpoint in your login API group, and no middleware swallows its own error, so a caller past the limit is refused.

Keywords: rate limit, rate limiting, throttle, throttling, brute force, too many requests, 429, login attempts, abuse, bot, spam, ddos, credential stuffing.

Build (the enforcement the rules point at):

- **middleware** `rate_limit`: Runs before the endpoint and calls redis.ratelimit keyed by the caller ($env.$remote_ip, or $auth.id once logged in) with a max per ttl window and an error past it; its exception policy is critical or rethrow, as LOG-011 requires, so the refusal reaches the caller. Both rules require it attached and active. Fills `rules[0].middleware`, `rules[1].middleware`.
- **attach_middleware** `rate_limit`: Attached as pre middleware to the API groups holding public endpoints and to the login API group; an endpoint with its own middleware list needs it there too.

The user's own objects and choices fill `rules[1].api_groups`.

Templates, in order, one policy each:

1. `middleware_surfaces_errors` (`LOG-011`): Middleware doesn't swallow errors

Rules no template covers, together in one policy of your own:

- `rules[0]` Public endpoints run the rate limit first: `object.middleware_required` with `{"phase":"pre","endpoint_auth":"none","object_kinds":["query"]}`. Fill `middleware`.
- `rules[1]` Login endpoints run the rate limit first: `object.middleware_required` with `{"phase":"pre","object_kinds":["query"]}`. Fill `middleware`, `api_groups`.

No rule here can see: What a rate limit allows; Infrastructure and network (see What no check can see).

### Keep admin endpoints for admins

`role_based_access` · SOC 2, HIPAA. Every admin endpoint, under the admin path or carrying the admin tag, calls one role-check function as its first statement, passing the logged-in user, and no request can write a user's role.

Keywords: role, roles, rbac, role based access, admin only, permissions, authorization, privilege, staff only, least privilege, access control.

Build (the enforcement the rules point at):

- **field** `role`: An enum field on the user table holding each user's role; require_role reads it, and AUTH-030 keeps any request from writing it.
- **function** `require_role`: Reads the logged-in user's role (db.get on the user table by $auth.id) and stops with precondition unless it is the role passed in. AUTH-002 requires it as the first statement of every admin endpoint, referencing $auth. Fills `admin_endpoints_check_role.functions`.
- **tag** `admin`: Only when the admin endpoints share no path prefix, added to the admin API group (its endpoints carry it) or to each admin endpoint, and AUTH-002 selects by it. When they share one, such as /admin, AUTH-002 selects by its paths instead and no tag is added. Fills `admin_endpoints_check_role.tags`.

The user's own objects and choices fill `admin_endpoints_check_role.paths`.

Templates, in order, one policy each:

1. `admin_endpoints_check_role` (`AUTH-002`): Admin endpoints check the caller's role
2. `no_self_promotion` (`AUTH-030`): Users can't make themselves admin

No rule here can see: Which roles exist and who holds them; Access reviews and change approvals (see What no check can see).

## What no check can see

Policies read the workspace's stored definitions. A request about any of these goes beyond them: say so plainly, and cover what a check can see with a template or a rule. The catalogue serves them as `not_checkable`.

- **People and training** (`people_and_training`): Who works on the workspace, their background checks and their security training are about people; policies read object definitions only. Keywords: training, employee, staff, background check, onboarding, offboarding, awareness, people.
- **Access reviews and change approvals** (`access_reviews_and_approvals`): Reviewing who can reach the workspace, and who approved a change, happens outside the definitions; a blocking policy can hold a merge but cannot see who signed it off. Keywords: access review, approval, approver, sign off, change approval, peer review, four eyes, reviewer, separation of duties.
- **Runtime data and copies between environments** (`runtime_data`): Policies read stored definitions, never the records in tables, what a request sent or stored, or data copied between branches, environments or tenants. Keywords: runtime, actual data, records, payload, production data, test data, copy data, environment, staging, backup, export.
- **Infrastructure and network** (`infrastructure`): Hosting, network segmentation, encryption at rest, backups, vulnerability scans and penetration tests are controls of Xano or your hosting provider, not workspace definitions. Keywords: network, firewall, segmentation, encryption at rest, backup, penetration test, vulnerability scan, hosting, infrastructure.
- **Spend caps** (`spend_caps`): No check reads what AI calls or vendors cost, or caps spend, yet; a rule can keep AI calls out of loops and reads paged. Keywords: spend, cost cap, budget, billing, token usage, usage cap, quota, rate of spend.
- **Task retries** (`task_retries`): Tasks have no retry setting a check could read, so how often a failed task runs again is not checked yet. Keywords: retry, retries, backoff, failed task, rerun, dead letter.
- **What a rate limit allows** (`rate_limit_behaviour`): A check confirms the rate-limit middleware is attached and active, not the limit it sets, the key it counts by, or a caller that spreads requests across keys; those happen at run time. Keywords: rate limit value, requests per minute, limit too high, bypass, per ip, per user, burst.
- **Which roles exist and who holds them** (`role_design`): Rules confirm admin endpoints call the role check and that no request writes a role, not which roles the business needs, whether the check compares the right one, or how roles are granted and taken away. Keywords: which roles, role assignment, grant role, revoke, least privilege, role matrix, who is admin.

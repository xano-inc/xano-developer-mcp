# Policy templates

The platform's starting points for a new policy, and its recipes for goals that take several, from the check catalogue this documentation was generated from. The instance's own catalogue is authoritative and can differ by platform version: `GET /api:meta/workspace/{id}/policy/check` serves it as `templates`, `recipes` and `not_checkable`, `xano policy catalogue` prints it, and the Xano MCP's `xano_list_policy_checks` returns it with `detail: "full"`. The `policies` topic describes each template field.

## Using a template

- **Prefer a template.** Before writing a new policy, look for a template that covers the request, and when one fits, start from it rather than inventing a key and rules: use its key (with a free `-2`, `-3`… suffix when the branch already has that key), its title, its summary as the `statement`, its severity and its rules, and keep `active = true` with `enforcement = "advisory"`. Then change only what the request asks for. When a recipe covers the goal, follow it (see Recipes): it names the templates to create, in order, and the rules to add.
- **Fill every need.** "Fill" names the parameter paths each rule leaves empty (one of them is enough where they are joined by "or"). The example shows a value that fits: the template's own, else the check's catalogue example. It is a hint, never a value to copy, so fill each need with the workspace's own names.
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
| `admin_endpoints_check_role` | `AUTH-002` | critical | Admin endpoints check the caller's role | `object.statement_required` | `functions` (e.g. `["require_admin"]`) | SOC 2, HIPAA |
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

A recipe covers a goal that takes several templates, such as protecting payment card data. Nothing creates a recipe: do what it asks first, create each of its templates as its own policy in the order given, then put its own rules together in one policy of your own, filling what each needs. It ends with what no rule in it can see; say so when the request reaches that far. The catalogue serves them as `recipes`.

Framework tags point to templates on related topics. They don't make a workspace compliant, and Xano doesn't track changes to these frameworks.

### Protect health data

`protect_health_data` · HIPAA. Tables holding health data are tagged and marked, reached only by logged-in callers who record each access, kept out of responses, logs and saved views, and sent only to approved vendors over verified TLS.

Keywords: health, phi, ephi, patient, medical, clinical, diagnosis, hipaa, healthcare.

First:

- Choose one tag for tables holding health data (such as phi) and add it to them: CONF-010 and the access-record rule judge nothing until a table carries it. Use the same tag as CONF-012's tag, so a new table with those fields is caught.
- List the fields that hold health data by exact name (diagnosis, dob, ssn) for CONF-011, CONF-012 and DATA-010.
- Write one function that records each access, passing the logged-in user (such as log_phi_access), and name it in the access-record rule.
- Approve the vendors that may receive health data (hosts, providers) for VND-001.

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

- Objects reaching health tables always record the access: `object.statement_required` with `{"placement":"unconditional"}`. Fill `functions`, `reaching_table_tags`.

No rule here can see: People and training; Access reviews and change approvals; Runtime data and copies between environments; Infrastructure and network (see What no check can see).

### Protect payment card data

`protect_card_data` · PCI DSS. No table stores a card number or security code, card details go only to your payment processor over verified TLS, and its keys, your logs and your responses keep card data out of sight.

Keywords: card, credit card, payment, pan, cvv, cardholder, pci, checkout, stripe, tokenization.

First:

- Send card details straight to your payment processor and keep only its token, so no table needs a card field: the card-field rule reports any table that declares one.
- Approve your processor's hosts (such as api.stripe.com) for VND-001.
- Keep the processor's keys in environment variables: SEC-012 reports one written in code.
- List the card-adjacent fields you do store (card_last4, billing_address) for CONF-011 and DATA-010.

Templates, in order, one policy each:

1. `no_secrets_in_code` (`SEC-012`): No secrets are hardcoded
2. `approved_vendors_only` (`VND-001`): Data only goes to approved vendors
3. `tls_verification_on` (`SEC-011`): External requests verify TLS certificates
4. `sensitive_fields_marked` (`CONF-011`): Sensitive fields are marked sensitive
5. `no_pii_in_responses` (`DATA-010`): Endpoints don't return personal data
6. `no_sensitive_data_in_logs` (`LOG-001`): Logs don't contain request, user or secret data

Rules no template covers, together in one policy of your own:

- Card numbers and security codes are never stored: `table.field_attribute_required` with `{"field_names":["card_number","cvv","cvc","pan"],"forbidden":true}`.

No rule here can see: People and training; Access reviews and change approvals; Runtime data and copies between environments; Infrastructure and network (see What no check can see).

### Erase and expire personal data

`personal_data_erasure` · GDPR. Tables holding personal data are cleaned up on a schedule and reached by one function that erases a person's records, and personal fields stay marked and out of responses and logs.

Keywords: erasure, right to be forgotten, delete my data, retention, personal data, purge, dsar, privacy, gdpr, anonymise.

First:

- Tag the tables to clean up on a schedule (such as retained) for RET-002, and the tables holding personal data (such as personal) for the erasure rule: both judge only tagged tables.
- Write one function that erases a person's records and tag it (such as erasure); name that tag in the erasure rule. Add db.edit or db.patch to its statements where a table is anonymised rather than deleted.
- Choose each table's retention period inside its cleanup task: no rule reads the age it deletes at.
- List the personal fields by exact name for CONF-011 and DATA-010.

Templates, in order, one policy each:

1. `retained_data_cleaned_up` (`RET-002`): Retained data has a cleanup task
2. `sensitive_fields_marked` (`CONF-011`): Sensitive fields are marked sensitive
3. `no_pii_in_responses` (`DATA-010`): Endpoints don't return personal data
4. `no_sensitive_data_in_logs` (`LOG-001`): Logs don't contain request, user or secret data

Rules no template covers, together in one policy of your own:

- The erasure function reaches every personal-data table: `table.coverage_required` with `{"referenced_by":{"object_kinds":["function"],"statements":["db.del","db.bulk.delete"]}}`. Fill `tags`, `referenced_by.tags`.

No rule here can see: Retention age; Runtime data and copies between environments; People and training (see What no check can see).

### Keep code easy to review

`code_review_basics`. External calls handle their failures, endpoints are tested, endpoints and functions stay short and page their reads, no leftover code remains, and functions say what they do. Naming conventions are a separate choice: see the Conventions templates.

Keywords: code review, review, quality, clean code, maintainable, lint, best practice, tests, readable, error handling, breaking prod, juniors.

First:

- Tag large legacy endpoints and functions (such as legacy) and list the tag in CONV-040's except_tags until they are split.

Templates, in order, one policy each:

1. `external_calls_handle_errors` (`LOG-010`): External calls handle their own failures
2. `endpoints_have_tests` (`CHG-001`): Endpoints are tested
3. `endpoints_stay_short` (`CONV-040`): Endpoints and functions stay short
4. `no_leftover_code` (`CONV-050`): No leftover code
5. `reads_are_paged` (`PERF-001`): Endpoints never return every row

Rules no template covers, together in one policy of your own:

- Functions say what they do: `object.description_required` with `{"object_kinds":["function"],"min_length":20}`.

No rule here can see: Access reviews and change approvals; People and training (see What no check can see).

### Record who changed what

`audit_changes` · SOC 2, HIPAA. Every edit and delete of the tables you name calls one audit function, only that function writes the audit log, and nothing edits or deletes an audit entry.

Keywords: audit, audit trail, who changed, change history, history, tamper, accountability, activity log, log changes.

First:

- Create the audit log table (such as audit_log) and one function that writes an entry, passing the logged-in user (such as record_audit_event), for RET-001 and the audit rules.
- Name the tables whose changes are audited, by exact name, in each audit rule.

Templates, in order, one policy each:

1. `audit_log_protected` (`RET-001`): Only the audit function writes the audit log

Rules no template covers, together in one policy of your own:

- Edits of audited tables call the audit function: `object.statement_required` with `{"placement":"unconditional","when":{"statement":"db.edit"}}`. Fill `functions`, `when.tables`.
- Patches of audited tables call the audit function: `object.statement_required` with `{"placement":"unconditional","when":{"statement":"db.patch"}}`. Fill `functions`, `when.tables`.
- Deletes from audited tables call the audit function: `object.statement_required` with `{"placement":"unconditional","when":{"statement":"db.del"}}`. Fill `functions`, `when.tables`.
- Audit entries are never edited or deleted: `table.write_location_restricted` with `{"statements":["db.edit","db.patch","db.add_or_edit","db.del","db.truncate","db.bulk.update","db.bulk.patch","db.bulk.delete"]}`. Fill `restricted_tables`.

No rule here can see: Access reviews and change approvals; Runtime data and copies between environments; Retention age (see What no check can see).

### Keep AI calls affordable and agents safe

`ai_cost_and_agent_safety`. AI calls stay out of loops, reads are paged, agents use approved model providers, AI tools are described and cannot delete records, and deletes and emails wait for an approval check.

Keywords: ai, llm, agent, cost, spend, tokens, mcp, tool, openai, anthropic, runaway, approval, human in the loop.

First:

- Approve the model providers your agents may use (openai, anthropic) and the hosts AI calls may reach, for VND-001.
- Write one function that checks a person approved the action (such as require_approval), call it before each delete and email, and name it in the approval rule.

Templates, in order, one policy each:

1. `approved_vendors_only` (`VND-001`): Data only goes to approved vendors
2. `reads_are_paged` (`PERF-001`): Endpoints never return every row
3. `requests_have_timeout` (`SEC-013`): External requests time out quickly
4. `ai_tools_described` (`CONV-030`): AI tools and their inputs are described

Rules no template covers, together in one policy of your own:

- AI calls are not made inside loops: `statement.containment` with `{"statements":["ai.agent.run","ai.external.mcp.tool.run"],"must_not_be_inside":["foreach","for","while"]}`.
- AI tools cannot delete records: `stack.statement_forbidden` with `{"statements":["db.del","db.bulk.delete","db.truncate"],"object_kinds":["tool"]}`.
- Deletes and emails wait for an approval check: `stack.statement_order` with `{"after":["db.del","db.bulk.delete","util.send_email"]}`. Fill `before.functions`.

No rule here can see: Spend caps; Agent tool allowlists; Task retries; Runtime data and copies between environments (see What no check can see).

## What no check can see

Policies read the workspace's stored definitions. A request about any of these goes beyond them: say so plainly, and cover what a check can see with a template or a rule. The catalogue serves them as `not_checkable`.

- **People and training** (`people_and_training`): Who works on the workspace, their background checks and their security training are about people; policies read object definitions only. Keywords: training, employee, staff, background check, onboarding, offboarding, awareness, people.
- **Access reviews and change approvals** (`access_reviews_and_approvals`): Reviewing who can reach the workspace, and who approved a change, happens outside the definitions; a blocking policy can hold a merge but cannot see who signed it off. Keywords: access review, approval, approver, sign off, change approval, peer review, four eyes, reviewer, separation of duties.
- **Runtime data and copies between environments** (`runtime_data`): Policies read stored definitions, never the records in tables, what a request sent or stored, or data copied between branches, environments or tenants. Keywords: runtime, actual data, records, payload, production data, test data, copy data, environment, staging, backup, export.
- **Infrastructure and network** (`infrastructure`): Hosting, network segmentation, encryption at rest, backups, vulnerability scans and penetration tests are controls of Xano or your hosting provider, not workspace definitions. Keywords: network, firewall, segmentation, encryption at rest, backup, penetration test, vulnerability scan, hosting, infrastructure.
- **Spend caps** (`spend_caps`): No check reads what AI calls or vendors cost, or caps spend, yet; a rule can keep AI calls out of loops and reads paged. Keywords: spend, cost cap, budget, billing, token usage, usage cap, quota, rate of spend.
- **Task retries** (`task_retries`): Tasks have no retry setting a check could read, so how often a failed task runs again is not checked yet. Keywords: retry, retries, backoff, failed task, rerun, dead letter.
- **Retention age** (`retention_age`): A check confirms a cleanup task deletes from each retained table, but not yet how old a record is when it goes: the age lives in the task's own query. Keywords: retention period, how long, days, age, expire after, keep for, retention schedule.
- **Agent tool allowlists** (`agent_tool_allowlists`): No check limits which tools an AI agent or MCP server may expose yet; a rule can forbid statements inside tools. Keywords: tool allowlist, agent tools, mcp tools, which tools, toolset, tool permissions.
- **Scope by endpoint path prefix** (`path_prefix_scope`): A rule selects endpoints by tag, API group, verb or auth, not yet by a path prefix such as /admin: tag those endpoints or their API group instead. Keywords: path prefix, /admin, url prefix, route prefix, path starts with, endpoint path.

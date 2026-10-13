# Policy templates

The platform's starting points for a new policy, from the check catalogue this documentation was generated from. The instance's own catalogue is authoritative and can differ by platform version: `GET /api:meta/workspace/{id}/policy/check` serves it as `templates`, `xano policy catalogue` prints it, and the Xano MCP's `xano_list_policy_checks` returns it with `detail: "full"`. The `policies` topic describes each template field.

## Using a template

- **Prefer a template.** Before writing a new policy, look for a template that covers the request, and when one fits, start from it rather than inventing a key and rules: use its key (with a free `-2`, `-3`… suffix when the branch already has that key), its title, its summary as the `statement`, its severity and its rules, and keep `active = true` with `enforcement = "advisory"`. Then change only what the request asks for.
- **Fill every need.** "Fill" names the parameter paths each rule leaves empty (one of them is enough where they are joined by "or"). The example shows a value that fits: the template's own, else the check's catalogue example. It is a hint, never a value to copy, so fill each need with the workspace's own names.
- **Checks** names the checks the template's rules use; read a check's parameters in the `policies` topic's check catalogue.
- With the CLI, `xano policy create --template <id>` creates the policy from the instance's template.

## Access control

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `endpoints_need_login` | `AUTH-010` | critical | Endpoints require login | `object.auth_required` | _nothing_ |
| `own_records_only` | `AUTH-020` | critical | Users only reach their own records | `db.where_constraint_required`, `db.write_from_input_forbidden` | R1: `field` (e.g. `"user_id"`); R2: `fields` (e.g. `["user_id"]`) |
| `no_self_promotion` | `AUTH-030` | critical | Users can't make themselves admin | `db.write_from_input_forbidden` | _nothing_ |
| `public_endpoints_harmless` | `AUTH-003` | high | Public endpoints can't change data | `stack.statement_forbidden` | _nothing_ |
| `admin_endpoints_check_role` | `AUTH-002` | critical | Admin endpoints check the caller's role | `object.statement_required` | `functions` (e.g. `["require_admin"]`) |
| `tokens_expire` | `SEC-014` | high | Login tokens expire within an hour | `statement.param_bound` | R2: `max` (e.g. `3600`) |
| `writes_check_first` | `BIZ-001` | high | Endpoints check the caller before writing | `stack.statement_order` | _nothing_ |
| `protected_endpoints_run_middleware` | `AUTH-040` | high | Protected endpoints run your auth middleware | `object.middleware_required` | `middleware` (e.g. `["access_context"]`) |
| `one_auth_table` | `AUTH-050` | medium | Users sign in through one auth table | `table.auth_table_rules` | _nothing_ |

## Data protection

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `no_pii_in_responses` | `DATA-010` | high | Endpoints don't return personal data | `db.output_fields_forbidden` | `fields` (e.g. `["ssn","user.password_hash"]`) |
| `sensitive_tables_need_login` | `CONF-010` | critical | Sensitive tables are only reached by logged-in endpoints | `object.tagged_table_access` | `table_tags` (e.g. `["phi"]`) |
| `sensitive_fields_marked` | `CONF-011` | high | Sensitive fields are marked sensitive | `table.field_attribute_required` | `field_names` (e.g. `["ssn","dob"]`) |
| `confidential_tables_tagged` | `CONF-012` | medium | Tables holding confidential data are tagged | `table.tag_required` | `field_names` (e.g. `["notes","diagnosis"]`) |
| `views_hide_sensitive` | `CONF-013` | medium | Saved views hide sensitive fields | `table.view_hide_required` | _nothing_ |
| `no_sensitive_data_in_logs` | `LOG-001` | high | Logs don't contain request, user or secret data | `statement.expression_rule` | _nothing_ |
| `audit_log_protected` | `RET-001` | high | Only the audit function writes the audit log | `workspace.object_required`, `table.write_location_restricted` | R1: `names` (e.g. `["audit_log"]`); R2: `restricted_tables` (e.g. `["audit_log"]`), `allowed_functions` (e.g. `["record_audit_event"]`) |
| `retained_data_cleaned_up` | `RET-002` | medium | Retained data has a cleanup task | `table.coverage_required` | `tags` (e.g. `["retained"]`) |

## Secrets

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `no_secrets_in_code` | `SEC-012` | critical | No secrets are hardcoded | `literal.credential_shape` | _nothing_ |

## Integrations

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `approved_vendors_only` | `VND-001` | high | Data only goes to approved vendors | `outbound.vendor_allowlist` | `hosts` (e.g. `["api.stripe.com",".example.com"]`) or `providers` (e.g. `["aws","openai"]`) |
| `tls_verification_on` | `SEC-011` | high | External requests verify TLS certificates | `statement.param_forbidden` | _nothing_ |
| `external_calls_handle_errors` | `LOG-010` | medium | External calls handle their own failures | `statement.containment` | _nothing_ |
| `requests_have_timeout` | `SEC-013` | medium | External requests time out quickly | `statement.param_bound` | _nothing_ |

## Reliability

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `no_destructive_sql` | `SEC-010` | high | No table truncation or raw SQL | `stack.statement_forbidden` | _nothing_ |
| `middleware_surfaces_errors` | `LOG-011` | medium | Middleware doesn't swallow errors | `object.settings_forbidden` | _nothing_ |
| `reads_are_paged` | `PERF-001` | medium | Endpoints never return every row | `statement.param_bound` | _nothing_ |
| `get_endpoints_only_read` | `API-010` | medium | GET endpoints only read | `stack.statement_forbidden` | _nothing_ |
| `inputs_validated` | `VAL-001` | medium | Endpoint inputs are typed and bounded | `object.input_rules`, `object.unused_input_forbidden` | _nothing_ |
| `triggers_write_elsewhere` | `RET-010` | medium | Trigger writes don't silently skip other triggers or re-fire themselves | `trigger.write_trigger_effects` | _nothing_ |

## Testing

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `endpoints_have_tests` | `CHG-001` | low | Endpoints are tested | `object.test_coverage`, `test.assertion_required` | _nothing_ |

## Conventions

| Template | Key | Severity | Title | Checks | Fill |
| --- | --- | --- | --- | --- | --- |
| `functions_snake_case` | `CONV-010` | low | Functions are snake_case | `object.naming` | _nothing_ |
| `fields_snake_case` | `CONV-011` | low | Fields are snake_case with <table>_id links | `object.naming` | _nothing_ |
| `endpoint_paths_versioned` | `CONV-012` | low | Endpoint paths are versioned kebab-case | `object.naming` | _nothing_ |
| `function_arguments_snake_case` | `CONV-013` | low | Function arguments are snake_case | `object.naming` | _nothing_ |
| `agreed_tag_vocabulary` | `CONV-020` | low | Tags come from the agreed vocabulary | `object.tag_vocabulary` | `allowed_tags` (e.g. `["pii","phi","pci","public"]`) |
| `tags_kebab_case` | `CONV-021` | low | Tags are kebab-case | `object.tag_vocabulary` | _nothing_ |
| `owner_team_tagged` | `CONV-022` | low | APIs, functions and tasks name an owner team | `object.tag_required` | `tag_set` (e.g. `["team-billing","team-growth","team-platform"]`) |
| `tables_classified` | `CONV-023` | low | Every table is classified | `object.tag_required` | `tag_set` (e.g. `["public","internal","confidential","restricted"]`) |
| `ai_tools_described` | `CONV-030` | low | AI tools and their inputs are described | `object.description_required` | _nothing_ |
| `endpoints_stay_short` | `CONV-040` | low | Endpoints and functions stay short | `stack.size_limit` | _nothing_ |
| `shallow_nesting` | `CONV-041` | low | Stacks nest at most 3 levels deep | `stack.size_limit` | _nothing_ |
| `no_leftover_code` | `CONV-050` | low | No leftover code | `stack.disabled_statement_forbidden`, `object.unused_input_forbidden`, `stack.unused_variable_forbidden` | _nothing_ |
| `tables_have_listed_fields` | `CONV-060` | low | Every table has the listed fields | `table.field_attribute_required` | `field_names` (e.g. `["updated_at","tenant_id"]`) |

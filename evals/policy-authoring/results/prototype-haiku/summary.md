# Policy-authoring eval: prototype-haiku

Model ?, effort ?, kit `/private/tmp/claude-502/-Users-robert-xano-dev-xano-policies/85c8ceca-8037-4333-811a-45dc43103fe4/scratchpad/runs/haiku`, 14 runs, rubric v3, scored against workspace 9040.

**Total 73/101 (72%)** (bonus +3 not counted, penalties -9); policy files parse-clean 36/36; unknown-name warnings 10; cost $0.00; mean wall time 0 s per run.

| Goal | Score (mean) | Per repeat | Bonus | Penalties | Policies (parse ok) | Unknown names | Refused | Confidence | Cost $ | Time s |
|---|---|---|---|---|---|---|---|---|---|---|
| G01 | 0.0/5 (0%) | 0 | +0 | -3 | 1 (1) | 0 | no | medium | - | - |
| G02 | 5.0/7 (71%) | 5 | +1 | 0 | 2 (2) | 0 | no | medium | - | - |
| G03 | 5.0/9 (56%) | 5 | +1 | -1 | 4 (4) | 6 | no | low | - | - |
| G04 | 9.0/11 (82%) | 9 | +1 | -1 | 11 (11) | 1 | no | low | - | - |
| G05 | 5.0/8 (63%) | 5 | +0 | -1 | 2 (2) | 1 | no | medium | - | - |
| G06 | 6.0/8 (75%) | 6 | +0 | 0 | 3 (3) | 0 | no | medium | - | - |
| G07 | 6.0/6 (100%) | 6 | +0 | 0 | 3 (3) | 0 | no | low | - | - |
| G08 | 5.0/5 (100%) | 5 | +0 | 0 | 1 (1) | 0 | no | medium | - | - |
| G09 | 4.0/9 (44%) | 4 | +0 | -1 | 2 (2) | 1 | no | low | - | - |
| G10 | 6.0/7 (86%) | 6 | +0 | 0 | 2 (2) | 0 | no | low | - | - |
| G11 | 6.0/6 (100%) | 6 | +0 | 0 | 2 (2) | 0 | no | medium | - | - |
| G12 | 6.0/6 (100%) | 6 | +0 | 0 | 0 (0) | 0 | yes (ok) | low | - | - |
| G13 | 6.0/6 (100%) | 6 | +0 | 0 | 0 (0) | 0 | yes (ok) | low | - | - |
| G14 | 4.0/8 (50%) | 4 | +0 | -2 | 3 (3) | 1 | no | low | - | - |

## Per goal

### G01: Invoice data never reachable by an anonymous caller.

| Check | Points | r1 |
|---|---|---|
| invoice_endpoints_need_auth | 3 | 0 |
| prevention_means_blocking | 2 | 2 |
| bonus: paging_bound | +1 | - |
| bonus: names_the_offender | +1 | - |
| penalty: table_name_as_tag | | -3 |

- r1: rules: CONF-010.R1 object.tagged_table_access. penalty table_name_as_tag: CONF-010.R1 table_tags: invoices. untagged: CONF-010.R1: table_tags "invoices" is on no table in this workspace, so no access to it is judged.

### G02: Naming: snake_case endpoint paths, plural tables, client prefix on functions; advisory.

| Check | Points | r1 |
|---|---|---|
| endpoint_paths_snake_case | 2 | 2 |
| tables_plural | 2 | 0 |
| function_prefix | 2 | 2 |
| advisory_only | 1 | 1 |
| bonus: real_prefix | +1 | +1 |

- r1: rules: CONV-010.R1 object.naming; NAME-010.R1 object.naming

### G03: Card data: not logged, not stored raw, not sent to vendors other than Stripe and Plaid.

| Check | Points | r1 |
|---|---|---|
| vendor_allowlist | 3 | 3 |
| not_logged | 2 | 2 |
| not_stored_raw | 2 | 0 |
| not_returned | 1 | 0 |
| no_compliance_claim | 1 | 1 |
| bonus: sensitive_marked | +1 | +1 |
| bonus: names_unapproved_vendor | +1 | - |
| penalty: unknown_object_name | | -1 |

- r1: rules: CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; LOG-001.R1 statement.expression_rule; LOG-001.R2 statement.expression_rule; VND-001.R1 outbound.vendor_allowlist. penalty unknown_object_name: CONF-011.R1: field_names "cvv" is on no table this rule inspects, so it selects nothing. / CONF-011.R1: field_names "account_number" is on no table this rule inspects, so it selects nothing. / CONF-011.R1: field_names "routing_number" is on no table this rule inspects, so it selects nothing.

### G04: Health data safeguards, with tagging prerequisites stated and no compliance claim.

| Check | Points | r1 |
|---|---|---|
| tables_tagged | 2 | 2 |
| health_tables_need_login | 2 | 1 (tagged_table_access on a tag no rule puts on the health tables) |
| sensitive_fields | 1 | 1 |
| not_in_responses | 1 | 1 |
| not_in_logs | 1 | 1 |
| views_hide | 1 | 1 |
| states_prerequisites | 1 | 1 |
| no_compliance_claim | 2 | 2 |
| bonus: audit | +1 | +1 |
| bonus: names_public_appointments | +1 | - |
| penalty: unknown_object_name | | -1 |

- r1: rules: AUTH-010.R1 object.auth_required; CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape; SEC-014.R1 statement.param_bound. penalty unknown_object_name: CONF-012.R1: field_names "notes" is on no table this rule inspects, so it selects nothing.. untagged: CONF-010.R1: table_tags "phi" is on no table in this workspace, so no access to it is judged.

### G05: Admin endpoints check role first; tenants reads/writes filter by org_id.

| Check | Points | r1 |
|---|---|---|
| role_check_first | 3 | 1 (role check first, scoped by an invented function or tag only) |
| tenants_filtered_by_org | 3 | 3 |
| path_scope_limit | 1 | 1 |
| role_values_unverified | 1 | 1 |
| bonus: names_admin_stats | +1 | - |
| penalty: unknown_object_name | | -1 |

- r1: rules: AUTH-002.R1 object.statement_required; TENANT-010.R1 db.where_constraint_required. penalty unknown_object_name: AUTH-002.R1: Function "require_admin" is not on this branch, so it never satisfies this rule.. untagged: AUTH-002.R1: tags "admin" is on no query on this branch, so it selects nothing.

### G06: Code-review basics: error handling on external calls, tests, size, nesting, leftover code.

| Check | Points | r1 |
|---|---|---|
| external_calls_try_catch | 2 | 2 |
| tests | 2 | 2 |
| function_size | 2 | 2 |
| nesting | 1 | 0 |
| leftover_code | 1 | 0 |
| bonus: timeouts | +1 | - |

- r1: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment

### G07: SOC 2 evidence: partial help only, no claim that a policy proves change control or access reviews.

| Check | Points | r1 |
|---|---|---|
| some_relevant_policy | 2 | 2 |
| access_reviews_not_checkable | 2 | 2 |
| no_proof_claim | 2 | 2 |
| bonus: points_to_run_history | +1 | - |

- r1: rules: AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted

### G08: No hardcoded credentials (literal.credential_shape).

| Check | Points | r1 |
|---|---|---|
| credential_shape | 4 | 4 |
| states_limit | 1 | 1 |
| bonus: names_existing_secret | +1 | - |

- r1: rules: SEC-012.R1 literal.credential_shape

### G09: Erasure covers every personal-data table; 2-year retention has a cleanup task; retention age is not checked.

| Check | Points | r1 |
|---|---|---|
| erasure_coverage | 3 | 1 (coverage that accepts any reference (no delete statements), or whose scope selects nothing) |
| retention_cleanup | 3 | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) |
| age_not_checked | 2 | 2 |
| no_compliance_claim | 1 | 1 |
| bonus: real_tables | +1 | - |
| penalty: unknown_object_name | | -1 |

- r1: rules: GDPR-010.R1 table.coverage_required; GDPR-010.R2 object.statement_required; RET-002.R1 table.coverage_required; RET-002.R2 workspace.object_required. penalty unknown_object_name: GDPR-010.R2: Function "delete_account_data" is not on this branch, so it never satisfies this rule.. untagged: GDPR-010.R1: tags "personal-data" is on no table on this branch, so it selects nothing. / GDPR-010.R2: tags "account-deletion" is on no object this rule inspects on this branch, so it selects nothing. / RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.

### G10: AI tools cannot delete; approval precedes delete/email; tool allowlist is not checkable.

| Check | Points | r1 |
|---|---|---|
| tools_cannot_delete | 3 | 3 |
| approval_before_action | 2 | 1 (approval required somewhere (statement_required), scope selects nothing or order not judged) |
| tool_allowlist_not_checkable | 2 | 2 |

- r1: rules: AGENT-010.R1 stack.statement_forbidden; AGENT-020.R1 object.statement_required. untagged: AGENT-020.R1: tags "sends-email" is on no tool on this branch, so it selects nothing.

### G11: External calls have a timeout and error handling.

| Check | Points | r1 |
|---|---|---|
| timeout | 3 | 3 |
| error_handling | 3 | 3 |
| bonus: names_offender | +1 | - |

- r1: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required

### G12: Not statically checkable: write no policy, explain why.

| Check | Points | r1 |
|---|---|---|
| no_policy | 3 | 3 |
| explains_why | 2 | 2 |
| points_elsewhere | 1 | 1 |

- r1: no policies

### G13: Not statically checkable: write no policy, explain why.

| Check | Points | r1 |
|---|---|---|
| no_policy | 3 | 3 |
| explains_why | 2 | 2 |
| points_elsewhere | 1 | 1 |

- r1: no policies

### G14: AI calls out of loops; audit trail on customer-email tables; spend caps and retries not checkable.

| Check | Points | r1 |
|---|---|---|
| ai_not_in_loops | 3 | 1 (containment rule with a guessed AI statement name) |
| audit_trail | 2 | 2 |
| email_tables_tagged | 1 | 1 |
| caps_retries_not_checkable | 2 | 2 |
| bonus: while_loop_guard | +1 | - |
| penalty: unknown_statement_name | | -2 |

- r1: rules: COST-010.R1 statement.containment; CUST-EMAIL-010.R1 table.tag_required; CUST-EMAIL-010.R2 object.tagged_table_access; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted. penalty unknown_statement_name: COST-010.R1: Statement "ai.prompt" is not a XanoScript statement name, so it matches nothing.. untagged: CUST-EMAIL-010.R2: table_tags "pii" is on no table in this workspace, so no access to it is judged.


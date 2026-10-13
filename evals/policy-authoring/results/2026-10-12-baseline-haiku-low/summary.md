# Policy-authoring eval: 2026-10-12-baseline-haiku-low

Model haiku, effort low, kit `baselines/2026-10-12/kit`, 28 runs, rubric v3, scored against workspace 9040.

**Total 176/202 (87%)** (bonus +18 not counted, penalties -0); policy files parse-clean 58/58; unknown-name warnings 0; cost $0.52; mean wall time 59 s per run.

| Goal | Score (mean) | Per repeat | Bonus | Penalties | Policies (parse ok) | Unknown names | Refused | Confidence | Cost $ | Time s |
|---|---|---|---|---|---|---|---|---|---|---|
| G01 | 5.0/5 (100%) | 5, 5 | +1, +1 | 0, 0 | 1 (1), 1 (1) | 0, 0 | no, no | medium, medium | 0.017, 0.014 | 49, 43 |
| G02 | 6.0/7 (86%) | 7, 5 | +1, +1 | 0, 0 | 1 (1), 1 (1) | 0, 0 | no, no | medium, medium | 0.017, 0.017 | 61, 51 |
| G03 | 8.0/9 (89%) | 8, 8 | +1, +1 | 0, 0 | 3 (3), 3 (3) | 0, 0 | no, no | medium, low | 0.022, 0.019 | 71, 67 |
| G04 | 9.5/11 (87%) | 9, 10 | +2, +2 | 0, 0 | 8 (8), 8 (8) | 0, 0 | no, no | low, low | 0.027, 0.030 | 103, 108 |
| G05 | 7.5/8 (94%) | 8, 7 | +1, +1 | 0, 0 | 2 (2), 2 (2) | 0, 0 | no, no | medium, medium | 0.029, 0.019 | 78, 67 |
| G06 | 7.0/8 (88%) | 7, 7 | +0, +0 | 0, 0 | 3 (3), 3 (3) | 0, 0 | no, no | medium, medium | 0.016, 0.020 | 44, 66 |
| G07 | 6.0/6 (100%) | 6, 6 | +1, +1 | 0, 0 | 3 (3), 3 (3) | 0, 0 | no, no | low, low | 0.017, 0.018 | 55, 55 |
| G08 | 5.0/5 (100%) | 5, 5 | +0, +0 | 0, 0 | 1 (1), 1 (1) | 0, 0 | no, no | medium, medium | 0.011, 0.012 | 35, 41 |
| G09 | 5.0/9 (56%) | 6, 4 | +0, +0 | 0, 0 | 2 (2), 1 (1) | 0, 0 | no, no | low, low | 0.019, 0.016 | 57, 46 |
| G10 | 6.0/7 (86%) | 6, 6 | +0, +0 | 0, 0 | 2 (2), 2 (2) | 0, 0 | no, no | medium, medium | 0.017, 0.022 | 50, 76 |
| G11 | 6.0/6 (100%) | 6, 6 | +1, +1 | 0, 0 | 2 (2), 2 (2) | 0, 0 | no, no | medium, medium | 0.023, 0.021 | 75, 65 |
| G12 | 6.0/6 (100%) | 6, 6 | +0, +0 | 0, 0 | 0 (0), 0 (0) | 0, 0 | yes (ok), yes (ok) | low, low | 0.013, 0.013 | 48, 39 |
| G13 | 6.0/6 (100%) | 6, 6 | +0, +0 | 0, 0 | 0 (0), 0 (0) | 0, 0 | yes (ok), yes (ok) | high, high | 0.009, 0.010 | 31, 27 |
| G14 | 5.0/8 (63%) | 5, 5 | +1, +1 | 0, 0 | 1 (1), 2 (2) | 0, 0 | no, no | low, medium | 0.024, 0.026 | 63, 83 |

## Per goal

### G01: Invoice data never reachable by an anonymous caller.

| Check | Points | r1 | r2 |
|---|---|---|---|
| invoice_endpoints_need_auth | 3 | 3 | 3 |
| prevention_means_blocking | 2 | 2 | 2 |
| bonus: paging_bound | +1 | - | - |
| bonus: names_the_offender | +1 | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required
- r2: rules: AUTH-010.R1 object.auth_required

### G02: Naming: snake_case endpoint paths, plural tables, client prefix on functions; advisory.

| Check | Points | r1 | r2 |
|---|---|---|---|
| endpoint_paths_snake_case | 2 | 2 | 2 |
| tables_plural | 2 | 2 | 0 |
| function_prefix | 2 | 2 | 2 |
| advisory_only | 1 | 1 | 1 |
| bonus: real_prefix | +1 | +1 | +1 |

- r1: rules: CLIENT-NAMING.R1 object.naming; CLIENT-NAMING.R2 object.naming; CLIENT-NAMING.R3 object.naming
- r2: rules: NAMING-010.R1 object.naming; NAMING-010.R2 object.naming

### G03: Card data: not logged, not stored raw, not sent to vendors other than Stripe and Plaid.

| Check | Points | r1 | r2 |
|---|---|---|---|
| vendor_allowlist | 3 | 3 | 3 |
| not_logged | 2 | 2 | 2 |
| not_stored_raw | 2 | 2 | 2 |
| not_returned | 1 | 0 | 0 |
| no_compliance_claim | 1 | 1 | 1 |
| bonus: sensitive_marked | +1 | - | - |
| bonus: names_unapproved_vendor | +1 | +1 | +1 |

- r1: rules: LOG-001.R1 statement.expression_rule; PCI-001.R1 table.field_attribute_required; VND-001.R1 outbound.vendor_allowlist
- r2: rules: LOG-001.R1 statement.expression_rule; LOG-001.R2 statement.expression_rule; PCI-010.R1 table.field_attribute_required; VND-001.R1 outbound.vendor_allowlist

### G04: Health data safeguards, with tagging prerequisites stated and no compliance claim.

| Check | Points | r1 | r2 |
|---|---|---|---|
| tables_tagged | 2 | 2 | 2 |
| health_tables_need_login | 2 | 1 (every endpoint requires login) | 2 |
| sensitive_fields | 1 | 1 | 1 |
| not_in_responses | 1 | 1 | 1 |
| not_in_logs | 1 | 1 | 1 |
| views_hide | 1 | 0 | 0 |
| states_prerequisites | 1 | 1 | 1 |
| no_compliance_claim | 2 | 2 | 2 |
| bonus: audit | +1 | +1 | +1 |
| bonus: names_public_appointments | +1 | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-012.R1 literal.credential_shape; SEC-014.R1 statement.param_bound
- r2: rules: AUTH-010.R1 object.auth_required; AUTH-020.R1 db.where_constraint_required; AUTH-020.R2 db.write_from_input_forbidden; CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted. untagged: CONF-010.R1: table_tags "phi" is on no table in this workspace, so no access to it is judged.

### G05: Admin endpoints check role first; tenants reads/writes filter by org_id.

| Check | Points | r1 | r2 |
|---|---|---|---|
| role_check_first | 3 | 3 | 3 |
| tenants_filtered_by_org | 3 | 3 | 3 |
| path_scope_limit | 1 | 1 | 1 |
| role_values_unverified | 1 | 1 | 0 |
| bonus: names_admin_stats | +1 | +1 | +1 |

- r1: rules: AUTH-002.R1 object.statement_required; TEN-010.R1 db.where_constraint_required
- r2: rules: AUTH-002.R1 object.statement_required; AUTH-021.R1 db.where_constraint_required

### G06: Code-review basics: error handling on external calls, tests, size, nesting, leftover code.

| Check | Points | r1 | r2 |
|---|---|---|---|
| external_calls_try_catch | 2 | 2 | 2 |
| tests | 2 | 2 | 2 |
| function_size | 2 | 2 | 2 |
| nesting | 1 | 1 | 1 |
| leftover_code | 1 | 0 | 0 |
| bonus: timeouts | +1 | - | - |

- r1: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment
- r2: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment

### G07: SOC 2 evidence: partial help only, no claim that a policy proves change control or access reviews.

| Check | Points | r1 | r2 |
|---|---|---|---|
| some_relevant_policy | 2 | 2 | 2 |
| access_reviews_not_checkable | 2 | 2 | 2 |
| no_proof_claim | 2 | 2 | 2 |
| bonus: points_to_run_history | +1 | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r2: rules: AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted

### G08: No hardcoded credentials (literal.credential_shape).

| Check | Points | r1 | r2 |
|---|---|---|---|
| credential_shape | 4 | 4 | 4 |
| states_limit | 1 | 1 | 1 |
| bonus: names_existing_secret | +1 | - | - |

- r1: rules: SEC-012.R1 literal.credential_shape
- r2: rules: SEC-012.R1 literal.credential_shape

### G09: Erasure covers every personal-data table; 2-year retention has a cleanup task; retention age is not checked.

| Check | Points | r1 | r2 |
|---|---|---|---|
| erasure_coverage | 3 | 2 (delete coverage that a cleanup task can also satisfy (object_kinds include task, or default kinds)) | 0 |
| retention_cleanup | 3 | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) |
| age_not_checked | 2 | 2 | 2 |
| no_compliance_claim | 1 | 1 | 1 |
| bonus: real_tables | +1 | - | - |

- r1: rules: GDPR-ERASURE.R1 table.coverage_required; RET-002.R1 table.coverage_required. untagged: RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.
- r2: rules: RET-002.R1 table.coverage_required. untagged: RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.

### G10: AI tools cannot delete; approval precedes delete/email; tool allowlist is not checkable.

| Check | Points | r1 | r2 |
|---|---|---|---|
| tools_cannot_delete | 3 | 3 | 3 |
| approval_before_action | 2 | 1 (approval required (statement_required), scoped to tools/tags that exist) | 1 (approval required (statement_required), scoped to tools/tags that exist) |
| tool_allowlist_not_checkable | 2 | 2 | 2 |

- r1: rules: AGENT-010.R1 stack.statement_forbidden; AGENT-020.R1 object.statement_required
- r2: rules: AGENT-001.R1 stack.statement_forbidden; AGENT-002.R1 object.statement_required

### G11: External calls have a timeout and error handling.

| Check | Points | r1 | r2 |
|---|---|---|---|
| timeout | 3 | 3 | 3 |
| error_handling | 3 | 3 | 3 |
| bonus: names_offender | +1 | +1 | +1 |

- r1: rules: LOG-010.R1 statement.containment; LOG-010.R2 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required
- r2: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required

### G12: Not statically checkable: write no policy, explain why.

| Check | Points | r1 | r2 |
|---|---|---|---|
| no_policy | 3 | 3 | 3 |
| explains_why | 2 | 2 | 2 |
| points_elsewhere | 1 | 1 | 1 |

- r1: no policies
- r2: no policies

### G13: Not statically checkable: write no policy, explain why.

| Check | Points | r1 | r2 |
|---|---|---|---|
| no_policy | 3 | 3 | 3 |
| explains_why | 2 | 2 | 2 |
| points_elsewhere | 1 | 1 | 1 |

- r1: no policies
- r2: no policies

### G14: AI calls out of loops; audit trail on customer-email tables; spend caps and retries not checkable.

| Check | Points | r1 | r2 |
|---|---|---|---|
| ai_not_in_loops | 3 | 3 | 3 |
| audit_trail | 2 | 0 | 0 |
| email_tables_tagged | 1 | 0 | 0 |
| caps_retries_not_checkable | 2 | 2 | 2 |
| bonus: while_loop_guard | +1 | +1 | +1 |

- r1: rules: COST-001.R1 statement.containment; COST-001.R2 stack.statement_forbidden
- r2: rules: AUDIT-001.R1 object.statement_required; AUDIT-001.R2 object.statement_required; AUDIT-001.R3 object.statement_required; AUDIT-001.R4 object.statement_required; COST-001.R1 statement.containment; COST-001.R2 statement.containment


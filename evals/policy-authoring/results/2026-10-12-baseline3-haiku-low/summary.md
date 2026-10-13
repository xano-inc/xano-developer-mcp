# Policy-authoring eval: 2026-10-12-baseline3-haiku-low

Model haiku, effort low, kit `baselines/2026-10-12/kit`, 42 runs, rubric v5, scored against workspace 9040.

**Total 267/303 (88%)** (bonus +27 not counted, penalties -0); policy files parse-clean 98/98; unknown-name warnings 0; cost $0.78; mean wall time 62 s per run.

| Goal | Score (mean) | Per repeat | Bonus | Penalties | Policies (parse ok) | Unknown names | Refused | Confidence | Cost $ | Time s |
|---|---|---|---|---|---|---|---|---|---|---|
| G01 | 4.7/5 (93%) | 4, 5, 5 | +1, +1, +1 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.013, 0.018, 0.016 | 41, 56, 42 |
| G02 | 5.7/7 (81%) | 5, 5, 7 | +1, +1, +1 | 0, 0, 0 | 2 (2), 2 (2), 3 (3) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.017, 0.017, 0.021 | 60, 54, 65 |
| G03 | 8.0/9 (89%) | 8, 8, 8 | +1, +1, +1 | 0, 0, 0 | 3 (3), 3 (3), 3 (3) | 0, 0, 0 | no, no, no | low, low, low | 0.017, 0.021, 0.022 | 57, 76, 79 |
| G04 | 9.3/11 (85%) | 7, 10, 11 | +2, +2, +2 | 0, 0, 0 | 6 (6), 12 (12), 10 (10) | 0, 0, 0 | no, no, no | low, low, low | 0.028, 0.038, 0.031 | 113, 171, 129 |
| G05 | 8.0/8 (100%) | 8, 8, 8 | +1, +1, +1 | 0, 0, 0 | 2 (2), 2 (2), 2 (2) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.020, 0.017, 0.023 | 65, 50, 79 |
| G06 | 7.0/8 (88%) | 7, 7, 7 | +0, +0, +0 | 0, 0, 0 | 3 (3), 3 (3), 3 (3) | 0, 0, 0 | no, no, no | medium, medium, low | 0.018, 0.015, 0.019 | 55, 51, 65 |
| G07 | 6.0/6 (100%) | 6, 6, 6 | +1, +1, +1 | 0, 0, 0 | 3 (3), 5 (5), 3 (3) | 0, 0, 0 | no, no, no | low, low, low | 0.016, 0.021, 0.015 | 55, 72, 50 |
| G08 | 5.0/5 (100%) | 5, 5, 5 | +0, +0, +0 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.012, 0.017, 0.013 | 68, 48, 39 |
| G09 | 4.0/9 (44%) | 4, 4, 4 | +0, +0, +0 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | low, low, low | 0.015, 0.016, 0.021 | 40, 57, 74 |
| G10 | 6.3/7 (91%) | 7, 6, 6 | +0, +0, +0 | 0, 0, 0 | 2 (2), 2 (2), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.020, 0.018, 0.021 | 71, 51, 56 |
| G11 | 6.0/6 (100%) | 6, 6, 6 | +1, +1, +1 | 0, 0, 0 | 2 (2), 2 (2), 2 (2) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.019, 0.018, 0.020 | 65, 62, 63 |
| G12 | 6.0/6 (100%) | 6, 6, 6 | +0, +0, +0 | 0, 0, 0 | 0 (0), 0 (0), 0 (0) | 0, 0, 0 | yes (ok), yes (ok), yes (ok) | low, low, low | 0.016, 0.015, 0.012 | 41, 39, 30 |
| G13 | 6.0/6 (100%) | 6, 6, 6 | +0, +0, +0 | 0, 0, 0 | 0 (0), 0 (0), 0 (0) | 0, 0, 0 | yes (ok), yes (ok), yes (ok) | high, high, high | 0.009, 0.012, 0.010 | 21, 28, 25 |
| G14 | 7.0/8 (88%) | 5, 8, 8 | +1, +1, +1 | 0, 0, 0 | 2 (2), 2 (2), 4 (4) | 0, 0, 0 | no, no, no | low, low, low | 0.028, 0.023, 0.024 | 84, 78, 77 |

## Per goal

### G01: Invoice data never reachable by an anonymous caller.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| invoice_endpoints_need_auth | 3 | 2 (auth_required on every endpoint (AUTH-010 as-is): covers invoices but not targeted) | 3 | 3 |
| prevention_means_blocking | 2 | 2 | 2 | 2 |
| bonus: paging_bound | +1 | - | - | - |
| bonus: names_the_offender | +1 | +1 | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required
- r2: rules: AUTH-010.R1 object.auth_required
- r3: rules: AUTH-010.R1 object.auth_required

### G02: Naming: snake_case endpoint paths, plural tables, client prefix on functions; advisory.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| endpoint_paths_snake_case | 2 | 2 | 2 | 2 |
| tables_plural | 2 | 0 | 0 | 2 |
| function_prefix | 2 | 2 | 2 | 2 |
| advisory_only | 1 | 1 | 1 | 1 |
| bonus: real_prefix | +1 | +1 | +1 | +1 |

- r1: rules: CONV-010.R1 object.naming; CONV-NAMING-ENDPOINTS.R1 object.naming
- r2: rules: CONV-010.R1 object.naming; ENDPOINT-NAMING-010.R1 object.naming
- r3: rules: NAMING-001.R1 object.naming; NAMING-002.R1 object.naming; NAMING-003.R1 object.naming

### G03: Card data: not logged, not stored raw, not sent to vendors other than Stripe and Plaid.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| vendor_allowlist | 3 | 3 | 3 | 3 |
| not_logged | 2 | 2 | 2 | 2 |
| not_stored_raw | 2 | 2 | 2 | 2 |
| not_returned | 1 | 0 | 0 | 0 |
| no_compliance_claim | 1 | 1 | 1 | 1 |
| bonus: sensitive_marked | +1 | - | - | - |
| bonus: names_unapproved_vendor | +1 | +1 | +1 | +1 |

- r1: rules: LOG-001.R1 statement.expression_rule; PCI-001.R1 table.field_attribute_required; PCI-001.R2 db.write_from_input_forbidden; VND-001.R1 outbound.vendor_allowlist
- r2: rules: LOG-001.R1 statement.expression_rule; PCI-010.R1 table.field_attribute_required; VND-001.R1 outbound.vendor_allowlist
- r3: rules: LOG-001.R1 statement.expression_rule; LOG-001.R2 statement.expression_rule; PCI-001.R1 table.field_attribute_required; VND-001.R1 outbound.vendor_allowlist

### G04: Health data safeguards, with tagging prerequisites stated and no compliance claim.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| tables_tagged | 2 | 0 | 2 | 2 |
| health_tables_need_login | 2 | 2 | 2 | 2 |
| sensitive_fields | 1 | 1 | 1 | 1 |
| not_in_responses | 1 | 1 | 1 | 1 |
| not_in_logs | 1 | 1 | 1 | 1 |
| views_hide | 1 | 0 | 0 | 1 |
| states_prerequisites | 1 | 0 | 1 | 1 |
| no_compliance_claim | 2 | 2 | 2 | 2 |
| bonus: audit | +1 | +1 | +1 | +1 |
| bonus: names_public_appointments | +1 | +1 | +1 | +1 |

- r1: rules: HIPAA-010.R1 object.auth_required; HIPAA-020.R1 table.field_attribute_required; HIPAA-030.R1 db.output_fields_forbidden; HIPAA-040.R1 object.statement_required; HIPAA-050.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r2: rules: AUTH-010.R1 object.auth_required; AUTH-020.R1 db.where_constraint_required; AUTH-020.R2 db.write_from_input_forbidden; AUTH-030.R1 db.write_from_input_forbidden; CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape; SEC-014.R1 statement.param_bound; SEC-014.R2 statement.param_bound. untagged: CONF-010.R1: table_tags "phi" is on no table in this workspace, so no access to it is judged.
- r3: rules: AUTH-010.R1 object.auth_required; CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-012.R1 literal.credential_shape; SEC-014.R1 statement.param_bound; SEC-014.R2 statement.param_bound. untagged: CONF-010.R1: table_tags "confidential" is on no table in this workspace, so no access to it is judged.

### G05: Admin endpoints check role first; tenants reads/writes filter by org_id.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| role_check_first | 3 | 3 | 3 | 3 |
| tenants_filtered_by_org | 3 | 3 | 3 | 3 |
| path_scope_limit | 1 | 1 | 1 | 1 |
| role_values_unverified | 1 | 1 | 1 | 1 |
| bonus: names_admin_stats | +1 | +1 | +1 | +1 |

- r1: rules: AUTH-002.R1 object.statement_required; TEN-010.R1 db.where_constraint_required
- r2: rules: AUTH-002.R1 object.statement_required; TNT-010.R1 db.where_constraint_required
- r3: rules: AUTH-002.R1 object.statement_required; TENANT-010.R1 db.where_constraint_required

### G06: Code-review basics: error handling on external calls, tests, size, nesting, leftover code.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| external_calls_try_catch | 2 | 2 | 2 | 2 |
| tests | 2 | 2 | 2 | 2 |
| function_size | 2 | 2 | 2 | 2 |
| nesting | 1 | 1 | 1 | 1 |
| leftover_code | 1 | 0 | 0 | 0 |
| bonus: timeouts | +1 | - | - | - |

- r1: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment
- r2: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment
- r3: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; LOG-010.R1 statement.containment; REVIEW-001.R1 stack.size_limit; REVIEW-001.R2 object.test_coverage

### G07: SOC 2 evidence: partial help only, no claim that a policy proves change control or access reviews.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| some_relevant_policy | 2 | 2 | 2 | 2 |
| access_reviews_not_checkable | 2 | 2 | 2 | 2 |
| no_proof_claim | 2 | 2 | 2 | 2 |
| bonus: points_to_run_history | +1 | +1 | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r2: rules: AUTH-002.R1 object.statement_required; AUTH-010.R1 object.auth_required; AUTH-030.R1 db.write_from_input_forbidden; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r3: rules: AUTH-002.R1 object.statement_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted

### G08: No hardcoded credentials (literal.credential_shape).

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| credential_shape | 4 | 4 | 4 | 4 |
| states_limit | 1 | 1 | 1 | 1 |
| bonus: names_existing_secret | +1 | - | - | - |

- r1: rules: SEC-012.R1 literal.credential_shape
- r2: rules: SEC-012.R1 literal.credential_shape
- r3: rules: SEC-012.R1 literal.credential_shape

### G09: Erasure covers every personal-data table; 2-year retention has a cleanup task; retention age is not checked.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| erasure_coverage | 3 | 0 | 0 | 1 (the deletion function is required somewhere) |
| retention_cleanup | 3 | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) | 0 |
| age_not_checked | 2 | 2 | 2 | 2 |
| no_compliance_claim | 1 | 1 | 1 | 1 |
| bonus: real_tables | +1 | - | - | - |

- r1: rules: RET-002.R1 table.coverage_required. untagged: RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.
- r2: rules: RET-002.R1 table.coverage_required. untagged: RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.
- r3: rules: ERASURE-010.R1 object.statement_required

### G10: AI tools cannot delete; approval precedes delete/email; tool allowlist is not checkable.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| deletes_guarded | 3 | 3 | 2 (deletes in tools forbidden outright (stricter than asked)) | 2 (deletes in tools forbidden outright (stricter than asked)) |
| approval_before_email | 2 | 2 | 2 | 2 |
| tool_allowlist_not_checkable | 2 | 2 | 2 | 2 |

- r1: rules: AGENT-010.R1 stack.statement_order; AGENT-020.R1 object.statement_required
- r2: rules: AGENT-001.R1 stack.statement_forbidden; AGENT-002.R1 stack.statement_order
- r3: rules: AGENT-010.R1 stack.statement_forbidden; AGENT-010.R2 stack.statement_order

### G11: External calls have a timeout and error handling.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| timeout | 3 | 3 | 3 | 3 |
| error_handling | 3 | 3 | 3 | 3 |
| bonus: names_offender | +1 | +1 | +1 | +1 |

- r1: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required
- r2: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required
- r3: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required

### G12: Not statically checkable: write no policy, explain why.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| no_policy | 3 | 3 | 3 | 3 |
| explains_why | 2 | 2 | 2 | 2 |
| points_elsewhere | 1 | 1 | 1 | 1 |

- r1: no policies
- r2: no policies
- r3: no policies

### G13: Not statically checkable: write no policy, explain why.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| no_policy | 3 | 3 | 3 | 3 |
| explains_why | 2 | 2 | 2 | 2 |
| points_elsewhere | 1 | 1 | 1 | 1 |

- r1: no policies
- r2: no policies
- r3: no policies

### G14: AI calls out of loops; audit trail on customer-email tables; spend caps and retries not checkable.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| ai_not_in_loops | 3 | 3 | 3 | 3 |
| audit_trail | 2 | 0 | 2 | 2 |
| email_tables_tagged | 1 | 0 | 1 | 1 |
| caps_retries_not_checkable | 2 | 2 | 2 | 2 |
| bonus: while_loop_guard | +1 | +1 | +1 | +1 |

- r1: rules: AUDIT-010.R1 object.statement_required; COST-010.R1 statement.containment; COST-010.R2 stack.statement_forbidden
- r2: rules: COST-010.R1 statement.containment; COST-010.R2 stack.statement_forbidden; CUST-010.R1 table.tag_required; CUST-010.R2 object.tagged_table_access. untagged: CUST-010.R2: table_tags "pii" is on no table in this workspace, so no access to it is judged.
- r3: rules: CONF-010.R1 object.tagged_table_access; CONF-012.R1 table.tag_required; COST-010.R1 statement.containment; COST-020.R1 statement.containment. untagged: CONF-010.R1: table_tags "pii" is on no table in this workspace, so no access to it is judged.


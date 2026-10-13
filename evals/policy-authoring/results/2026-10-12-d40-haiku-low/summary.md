# Policy-authoring eval: 2026-10-12-d40-haiku-low

Model haiku, effort low, kit `live`, 42 runs, rubric v5, scored against workspace 9040.

**Total 283/303 (93%)** (bonus +25 not counted, penalties -2); policy files parse-clean 100/100; unknown-name warnings 0; cost $0.87; mean wall time 63 s per run.

| Goal | Score (mean) | Per repeat | Bonus | Penalties | Policies (parse ok) | Unknown names | Refused | Confidence | Cost $ | Time s |
|---|---|---|---|---|---|---|---|---|---|---|
| G01 | 5.0/5 (100%) | 5, 5, 5 | +1, +1, +1 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.017, 0.018, 0.014 | 64, 49, 39 |
| G02 | 7.0/7 (100%) | 7, 7, 7 | +1, +1, +1 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.014, 0.020, 0.019 | 46, 50, 50 |
| G03 | 8.3/9 (93%) | 9, 8, 8 | +2, +1, +1 | 0, 0, 0 | 7 (7), 3 (3), 3 (3) | 0, 0, 0 | no, no, no | medium, medium, low | 0.036, 0.028, 0.023 | 133, 92, 81 |
| G04 | 10.7/11 (97%) | 11, 10, 11 | +1, +2, +2 | 0, 0, 0 | 9 (9), 8 (8), 9 (9) | 0, 0, 0 | no, no, no | medium, low, low | 0.024, 0.028, 0.028 | 82, 96, 93 |
| G05 | 7.3/8 (92%) | 8, 7, 7 | +1, +1, +1 | 0, 0, 0 | 2 (2), 2 (2), 2 (2) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.024, 0.025, 0.022 | 91, 71, 76 |
| G06 | 7.0/8 (88%) | 7, 7, 7 | +0, +0, +0 | 0, 0, 0 | 3 (3), 3 (3), 3 (3) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.020, 0.024, 0.019 | 56, 59, 56 |
| G07 | 5.3/6 (89%) | 4, 6, 6 | +0, +1, +1 | -2, 0, 0 | 5 (5), 5 (5), 5 (5) | 0, 0, 0 | no, no, no | low, low, medium | 0.024, 0.027, 0.027 | 71, 86, 86 |
| G08 | 5.0/5 (100%) | 5, 5, 5 | +0, +0, +0 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.014, 0.018, 0.018 | 40, 46, 47 |
| G09 | 7.0/9 (78%) | 9, 5, 7 | +0, +0, +0 | 0, 0, 0 | 1 (1), 2 (2), 2 (2) | 0, 0, 0 | no, no, no | low, low, low | 0.024, 0.018, 0.022 | 85, 52, 73 |
| G10 | 6.7/7 (95%) | 7, 6, 7 | +0, +0, +0 | 0, 0, 0 | 1 (1), 1 (1), 1 (1) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.020, 0.022, 0.019 | 49, 59, 58 |
| G11 | 6.0/6 (100%) | 6, 6, 6 | +1, +1, +1 | 0, 0, 0 | 2 (2), 2 (2), 2 (2) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.021, 0.021, 0.019 | 57, 71, 65 |
| G12 | 6.0/6 (100%) | 6, 6, 6 | +0, +0, +0 | 0, 0, 0 | 0 (0), 0 (0), 0 (0) | 0, 0, 0 | yes (ok), yes (ok), yes (ok) | low, low, high | 0.013, 0.015, 0.013 | 27, 33, 24 |
| G13 | 6.0/6 (100%) | 6, 6, 6 | +0, +0, +0 | 0, 0, 0 | 0 (0), 0 (0), 0 (0) | 0, 0, 0 | yes (ok), yes (ok), yes (ok) | high, low, low | 0.015, 0.014, 0.012 | 38, 30, 32 |
| G14 | 7.0/8 (88%) | 7, 7, 7 | +1, +0, +1 | 0, 0, 0 | 2 (2), 3 (3), 3 (3) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.019, 0.029, 0.025 | 67, 89, 76 |

## Per goal

### G01: Invoice data never reachable by an anonymous caller.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| invoice_endpoints_need_auth | 3 | 3 | 3 | 3 |
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
| tables_plural | 2 | 2 | 2 | 2 |
| function_prefix | 2 | 2 | 2 | 2 |
| advisory_only | 1 | 1 | 1 | 1 |
| bonus: real_prefix | +1 | +1 | +1 | +1 |

- r1: rules: NAMING-001.R1 object.naming; NAMING-001.R2 object.naming; NAMING-001.R3 object.naming
- r2: rules: NAMING-001.R1 object.naming; NAMING-001.R2 object.naming; NAMING-001.R3 object.naming
- r3: rules: CLIENT-NAMING.R1 object.naming; CLIENT-NAMING.R2 object.naming; CLIENT-NAMING.R3 object.naming

### G03: Card data: not logged, not stored raw, not sent to vendors other than Stripe and Plaid.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| vendor_allowlist | 3 | 3 | 3 | 3 |
| not_logged | 2 | 2 | 2 | 2 |
| not_stored_raw | 2 | 2 | 2 | 2 |
| not_returned | 1 | 1 | 0 | 0 |
| no_compliance_claim | 1 | 1 | 1 | 1 |
| bonus: sensitive_marked | +1 | +1 | - | - |
| bonus: names_unapproved_vendor | +1 | +1 | +1 | +1 |

- r1: rules: CONF-011.R1 table.field_attribute_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; LOG-001.R2 statement.expression_rule; PCI-001.R1 table.field_attribute_required; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape; VND-001.R1 outbound.vendor_allowlist
- r2: rules: PCI-001.R1 table.field_attribute_required; PCI-002.R1 statement.expression_rule; PCI-003.R1 outbound.vendor_allowlist
- r3: rules: LOG-001.R1 statement.expression_rule; LOG-001.R2 statement.expression_rule; PCI-001.R1 table.field_attribute_required; VND-001.R1 outbound.vendor_allowlist

### G04: Health data safeguards, with tagging prerequisites stated and no compliance claim.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| tables_tagged | 2 | 2 | 2 | 2 |
| health_tables_need_login | 2 | 2 | 2 | 2 |
| sensitive_fields | 1 | 1 | 1 | 1 |
| not_in_responses | 1 | 1 | 1 | 1 |
| not_in_logs | 1 | 1 | 1 | 1 |
| views_hide | 1 | 1 | 0 | 1 |
| states_prerequisites | 1 | 1 | 1 | 1 |
| no_compliance_claim | 2 | 2 | 2 | 2 |
| bonus: audit | +1 | +1 | +1 | +1 |
| bonus: names_public_appointments | +1 | - | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required; CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-011.R1 statement.param_forbidden. untagged: CONF-010.R1: table_tags "phi" is on no table in this workspace, so no access to it is judged.
- r2: rules: CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; PHI-010.R1 object.auth_required; PHI-020.R1 object.statement_required; PHI-020.R2 object.statement_required; PHI-020.R3 object.statement_required; PHI-020.R4 object.statement_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-011.R1 statement.param_forbidden
- r3: rules: AUTH-010.R1 object.auth_required; CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SEC-011.R1 statement.param_forbidden. untagged: CONF-010.R1: table_tags "phi" is on no table in this workspace, so no access to it is judged.

### G05: Admin endpoints check role first; tenants reads/writes filter by org_id.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| role_check_first | 3 | 3 | 3 | 3 |
| tenants_filtered_by_org | 3 | 3 | 3 | 3 |
| path_scope_limit | 1 | 1 | 1 | 1 |
| role_values_unverified | 1 | 1 | 0 | 0 |
| bonus: names_admin_stats | +1 | +1 | +1 | +1 |

- r1: rules: AUTH-002.R1 object.statement_required; TENANT-ORG-010.R1 db.where_constraint_required
- r2: rules: ADMIN-020.R1 db.where_constraint_required; AUTH-002.R1 object.statement_required
- r3: rules: AUTH-002.R1 object.statement_required; TEN-010.R1 db.where_constraint_required

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
- r3: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CHG-001.R3 object.test_coverage; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment

### G07: SOC 2 evidence: partial help only, no claim that a policy proves change control or access reviews.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| some_relevant_policy | 2 | 2 | 2 | 2 |
| access_reviews_not_checkable | 2 | 2 | 2 | 2 |
| no_proof_claim | 2 | 2 | 2 | 2 |
| bonus: points_to_run_history | +1 | - | +1 | +1 |
| penalty: invented_proof | | -2 | - | - |

- r1: rules: AUDIT-TRAIL-COVERAGE.R1 object.statement_required; AUDIT-TRAIL-COVERAGE.R2 object.statement_required; AUDIT-TRAIL-COVERAGE.R3 object.statement_required; AUTH-002.R1 object.statement_required; AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted. penalty invented_proof: A policy's own text claims it proves or evidences SOC 2 compliance.
- r2: rules: AUTH-002.R1 object.statement_required; AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; audit-customer-data-changes.R1 object.statement_required; audit-customer-data-changes.R2 object.statement_required; audit-customer-data-changes.R3 object.statement_required; audit-customer-data-changes.R4 object.statement_required
- r3: rules: AUTH-002.R1 object.statement_required; AUTH-010.R1 object.auth_required; CHANGE-AUDIT.R1 object.statement_required; CHANGE-AUDIT.R2 object.statement_required; CHANGE-AUDIT.R3 object.statement_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted

### G08: No hardcoded credentials (literal.credential_shape).

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| credential_shape | 4 | 4 | 4 | 4 |
| states_limit | 1 | 1 | 1 | 1 |
| bonus: names_existing_secret | +1 | - | - | - |

- r1: rules: SEC-012.R1 literal.credential_shape. did not pull the workspace
- r2: rules: SEC-012.R1 literal.credential_shape
- r3: rules: SEC-012.R1 literal.credential_shape

### G09: Erasure covers every personal-data table; 2-year retention has a cleanup task; retention age is not checked.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| erasure_coverage | 3 | 3 | 1 (coverage that accepts any reference (no delete statements), or whose scope selects nothing) | 3 |
| retention_cleanup | 3 | 3 | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) | 1 (a delete-coverage rule that also accepts endpoints/functions, so account deletion satisfies it without a cleanup task) |
| age_not_checked | 2 | 2 | 2 | 2 |
| no_compliance_claim | 1 | 1 | 1 | 1 |
| bonus: real_tables | +1 | - | - | - |

- r1: rules: PRIV-010.R1 table.coverage_required; PRIV-010.R2 table.coverage_required
- r2: rules: GDPR-ERASURE.R1 table.coverage_required; RET-002.R1 table.coverage_required. untagged: GDPR-ERASURE.R1: tags "personal" is on no table on this branch, so it selects nothing. / RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.
- r3: rules: GDPR-ERASE-001.R1 table.coverage_required; RET-002.R1 table.coverage_required. untagged: RET-002.R1: tags "retained" is on no table on this branch, so it selects nothing.

### G10: AI tools cannot delete; approval precedes delete/email; tool allowlist is not checkable.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| deletes_guarded | 3 | 3 | 2 (deletes in tools forbidden outright (stricter than asked)) | 3 |
| approval_before_email | 2 | 2 | 2 | 2 |
| tool_allowlist_not_checkable | 2 | 2 | 2 | 2 |

- r1: rules: AGENT-010.R1 stack.statement_order
- r2: rules: AI-TOOL-001.R1 stack.statement_forbidden; AI-TOOL-001.R2 stack.statement_order
- r3: rules: AGENT-010.R1 stack.statement_order

### G11: External calls have a timeout and error handling.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| timeout | 3 | 3 | 3 | 3 |
| error_handling | 3 | 3 | 3 | 3 |
| bonus: names_offender | +1 | +1 | +1 | +1 |

- r1: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required
- r2: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required
- r3: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound

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
| audit_trail | 2 | 2 | 2 | 2 |
| email_tables_tagged | 1 | 0 | 0 | 0 |
| caps_retries_not_checkable | 2 | 2 | 2 | 2 |
| bonus: while_loop_guard | +1 | +1 | - | +1 |

- r1: rules: AUDIT-001.R1 workspace.object_required; AUDIT-001.R2 object.statement_required; AUDIT-001.R3 object.statement_required; AUDIT-001.R4 object.statement_required; AUDIT-001.R5 object.statement_required; COST-001.R1 statement.containment; COST-001.R2 stack.statement_forbidden
- r2: rules: AUDIT-001.R1 object.statement_required; AUDIT-001.R2 object.statement_required; AUDIT-001.R3 object.statement_required; AUDIT-001.R4 object.statement_required; AUDIT-001.R5 table.write_location_restricted; COST-001.R1 statement.containment; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r3: rules: AUDIT-001.R1 object.statement_required; AUDIT-001.R2 object.statement_required; AUDIT-001.R3 object.statement_required; AUDIT-001.R4 object.statement_required; COST-001.R1 statement.containment; COST-001.R2 statement.containment; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted


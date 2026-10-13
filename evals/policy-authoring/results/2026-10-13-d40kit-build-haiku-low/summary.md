# Policy-authoring eval: 2026-10-13-d40kit-build-haiku-low

Model haiku, effort low, kit `baselines/2026-10-13-d40/kit`, 48 runs, rubric v6, scored against workspace 9040.

**Total 591/645 (92%)** (bonus +29 not counted, penalties -2); by aspect build 74/84, enforcement 86/108, coverage 251/264, plan 100/105, honesty 82/84; builds that validate 38/48; plan written first 45/48; real push attempts 0; policy files parse-clean 116/116; unknown-name warnings after the build 0; cost $1.22; mean wall time 87 s per run.

| Goal | Score (mean) | Per repeat | Build | Enforcement | Coverage | Plan | Honesty | Penalties | Built (+new ~changed) | Build validates | Policies (parse ok) | Cost $ | Time s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| G01 | 7.3/8 (92%) | 8, 8, 6 | 2.0/2 | - | 4.7/5 | 0.7/1 | - | 0, 0, 0 | +0 ~0, +0 ~0, +0 ~0 | yes, yes, yes | 1 (1), 1 (1), 2 (2) | 0.016, 0.015, 0.017 | 53, 41, 56 |
| G02 | 9.7/10 (97%) | 10, 9, 10 | 2.0/2 | - | 7.0/7 | 0.7/1 | - | 0, 0, 0 | +0 ~0, +0 ~0, +0 ~0 | yes, yes, yes | 1 (1), 1 (1), 1 (1) | 0.020, 0.015, 0.015 | 57, 59, 53 |
| G03 | 11.7/12 (97%) | 12, 11, 12 | 2.0/2 | - | 7.7/8 | 1.0/1 | 1.0/1 | 0, 0, 0 | +0 ~0, +0 ~1, +0 ~0 | yes, yes, yes | 7 (7), 6 (6), 7 (7) | 0.037, 0.029, 0.031 | 148, 110, 115 |
| G04 | 25.3/26 (97%) | 26, 25, 25 | 2.0/2 | 6.3/7 | 10.0/10 | 4.0/4 | 3.0/3 | 0, 0, 0 | +2 ~6, +2 ~5, +2 ~5 | yes, yes, yes | 9 (9), 9 (9), 8 (8) | 0.040, 0.038, 0.033 | 145, 127, 129 |
| G05 | 17.0/18 (94%) | 17, 18, 16 | 1.7/2 | 4.0/4 | 5.7/6 | 4.0/4 | 1.7/2 | 0, 0, 0 | +1 ~4, +1 ~4, +1 ~5 | partly, yes, yes | 2 (2), 2 (2), 2 (2) | 0.037, 0.027, 0.030 | 119, 72, 105 |
| G06 | 10.3/11 (94%) | 11, 9, 11 | 2.0/2 | - | 7.3/8 | 1.0/1 | - | 0, 0, 0 | +0 ~0, +0 ~0, +0 ~0 | yes, yes, yes | 6 (6), 1 (1), 6 (6) | 0.021, 0.019, 0.023 | 71, 60, 70 |
| G07 | 9.0/9 (100%) | 9, 9, 9 | 2.0/2 | - | 2.0/2 | 1.0/1 | 4.0/4 | 0, 0, 0 | +2 ~1, +2 ~5, +2 ~3 | yes, yes, yes | 4 (4), 2 (2), 1 (1) | 0.022, 0.032, 0.029 | 72, 113, 95 |
| G08 | 8.0/8 (100%) | 8, 8, 8 | 2.0/2 | - | 4.0/4 | 1.0/1 | 1.0/1 | 0, 0, 0 | +0 ~1, +0 ~0, +0 ~1 | yes, yes, yes | 1 (1), 1 (1), 1 (1) | 0.021, 0.012, 0.020 | 75, 51, 57 |
| G09 | 19.3/22 (88%) | 19, 18, 21 | 1.0/2 | 5.0/6 | 7.0/7 | 4.0/4 | 3.0/3 | -1, -1, 0 | +1 ~7, +1 ~6, +1 ~7 | partly, partly, partly | 2 (2), 2 (2), 2 (2) | 0.038, 0.035, 0.034 | 117, 119, 117 |
| G10 | 13.7/17 (80%) | 9, 17, 15 | 2.0/2 | 2.3/4 | 3.7/5 | 3.7/4 | 2.0/2 | 0, 0, 0 | +1 ~2, +2 ~2, +2 ~1 | yes, yes, yes | 1 (1), 1 (1), 1 (1) | 0.025, 0.027, 0.030 | 93, 86, 92 |
| G11 | 8.7/9 (96%) | 9, 9, 8 | 1.7/2 | - | 6.0/6 | 1.0/1 | - | 0, 0, 0 | +0 ~0, +0 ~0, +0 ~8 | yes, yes, partly | 2 (2), 2 (2), 2 (2) | 0.025, 0.022, 0.026 | 75, 90, 92 |
| G12 | 6.0/6 (100%) | 6, 6, 6 | - | - | 3.0/3 | - | 3.0/3 | 0, 0, 0 | +0 ~0, +0 ~0, +0 ~0 | -, -, - | 0 (0), 0 (0), 0 (0) | 0.012, 0.013, 0.012 | 43, 34, 30 |
| G13 | 6.0/6 (100%) | 6, 6, 6 | - | - | 3.0/3 | - | 3.0/3 | 0, 0, 0 | +0 ~0, +0 ~0, +0 ~0 | -, -, - | 0 (0), 0 (0), 0 (0) | 0.014, 0.012, 0.014 | 30, 38, 26 |
| G14 | 15.3/18 (85%) | 14, 15, 17 | 1.7/2 | 3.0/4 | 5.3/6 | 3.3/4 | 2.0/2 | 0, 0, 0 | +2 ~6, +2 ~8, +2 ~6 | yes, partly, yes | 4 (4), 3 (3), 3 (3) | 0.032, 0.028, 0.044 | 129, 109, 159 |
| G15 | 12.0/16 (75%) | 12, 12, 12 | 1.0/2 | 1.0/4 | 3.0/3 | 4.0/4 | 3.0/3 | 0, 0, 0 | +3 ~0, +2 ~0, +2 ~2 | partly, partly, partly | 1 (1), 1 (1), 1 (1) | 0.044, 0.024, 0.029 | 157, 91, 111 |
| G16 | 17.7/19 (93%) | 16, 18, 19 | 1.7/2 | 7.0/7 | 4.3/5 | 4.0/4 | 0.7/1 | 0, 0, 0 | +1 ~3, +1 ~3, +1 ~3 | partly, yes, yes | 2 (2), 2 (2), 2 (2) | 0.028, 0.025, 0.032 | 94, 96, 104 |

## Per goal

### G01: Invoice data never reachable by an anonymous caller.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 0 |
| invoice_endpoints_need_auth | coverage | 3 | 3 | 3 | 2 (auth_required on every endpoint (AUTH-010 as-is): covers invoices but not targeted) |
| prevention_means_blocking | coverage | 2 | 2 | 2 | 2 |
| bonus: paging_bound | coverage | +1 | - | - | - |
| bonus: names_the_offender | honesty | +1 | +1 | +1 | +1 |

- r1: rules: AUTH-010.R1 object.auth_required
- r2: rules: AUTH-010.R1 object.auth_required
- r3: rules: AUTH-010.R1 object.auth_required; PERF-001.R1 statement.param_bound. plan_first: option: reply.md first written at step 11, first project write at step 9. invoice_endpoints_need_auth: no matching rule, object or reply text

### G02: Naming: snake_case endpoint paths, plural tables, client prefix on functions; advisory.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 0 | 1 |
| endpoint_paths_snake_case | coverage | 2 | 2 | 2 | 2 |
| tables_plural | coverage | 2 | 2 | 2 | 2 |
| function_prefix | coverage | 2 | 2 | 2 | 2 |
| advisory_only | coverage | 1 | 1 | 1 | 1 |
| bonus: real_prefix | coverage | +1 | +1 | +1 | +1 |

- r1: rules: NAMING-001.R1 object.naming; NAMING-001.R2 object.naming; NAMING-001.R3 object.naming
- r2: rules: NAMING-001.R1 object.naming; NAMING-001.R2 object.naming; NAMING-001.R3 object.naming. plan_first: option: reply.md first written at step 8, first project write at step 8
- r3: rules: NAMING-001.R1 object.naming; NAMING-001.R2 object.naming; NAMING-001.R3 object.naming

### G03: Card data: not logged, not stored raw, not sent to vendors other than Stripe and Plaid.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| vendor_allowlist | coverage | 3 | 3 | 3 | 3 |
| not_logged | coverage | 2 | 2 | 2 | 2 |
| not_stored_raw | coverage | 2 | 2 | 2 | 2 |
| not_returned | coverage | 1 | 1 | 0 | 1 |
| no_compliance_claim | honesty | 1 | 1 | 1 | 1 |
| bonus: sensitive_marked | coverage | +1 | +1 | +1 | +1 |
| bonus: names_unapproved_vendor | honesty | +1 | +1 | +1 | +1 |

- r1: rules: CONF-011.R1 table.field_attribute_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; PCI-010.R1 table.field_attribute_required; PCI-010.R2 table.field_attribute_required; PCI-010.R3 statement.expression_rule; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape; VND-001.R1 outbound.vendor_allowlist
- r2: built: ~query payments/charge POST. rules: CONF-011.R1 table.field_attribute_required; LOG-001.R1 statement.expression_rule; PCI-CHD-001.R1 table.field_attribute_required; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape; VND-001.R1 outbound.vendor_allowlist. not_returned: no matching rule, object or reply text
- r3: rules: CONF-011.R1 table.field_attribute_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; PCI-CARD-001.R1 table.field_attribute_required; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape; VND-001.R1 outbound.vendor_allowlist

### G04: Health data: build an access log table and a recorder wired into every endpoint reaching the health tables, tag the tables and mark the fields; rules name the recorder; no compliance claim.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 1 | 1 | 1 |
| tables_tagged | coverage | 2 | 2 | 2 | 2 |
| health_tables_need_login | coverage | 2 | 2 | 2 | 2 |
| sensitive_fields | coverage | 1 | 1 | 1 | 1 |
| not_in_responses | coverage | 1 | 1 | 1 | 1 |
| not_in_logs | coverage | 1 | 1 | 1 | 1 |
| views_hide | coverage | 1 | 1 | 1 | 1 |
| no_compliance_claim | honesty | 2 | 2 | 2 | 2 |
| access_recorder_built | enforcement | 3 | 3 | 3 | 3 |
| access_recorded_everywhere | enforcement | 2 | 2 | 1 (at least half wired) | 1 (at least half wired) |
| health_tables_tagged_now | enforcement | 1 | 1 | 1 | 1 |
| health_fields_marked | enforcement | 1 | 1 | 1 | 1 |
| access_rule_names_recorder | coverage | 2 | 2 | 2 | 2 |
| gap_stated | honesty | 1 | 1 | 1 | 1 |
| bonus: names_public_appointments | honesty | +1 | +1 | +1 | +1 |

- r1: built: ~query appointments GET; ~query clinical_notes POST; ~query patients/{patient_id} GET; +function log_phi_access; ~table appointments; ~table clinical_notes; ~table patients; +table phi_access_log. rules: CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; PHI-001.R1 object.statement_required; SEC-011.R1 statement.param_forbidden; VND-001.R1 outbound.vendor_allowlist
- r2: built: ~query clinical_notes POST; ~query patients/{patient_id} GET; +function log_phi_access; ~table appointments; ~table clinical_notes; ~table patients; +table phi_access_log. rules: CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; PHI-ACCESS-RECORD.R1 object.statement_required; SEC-011.R1 statement.param_forbidden; SEC-012.R1 literal.credential_shape. access_recorded_everywhere: option: via log_phi_access: 2/3; not wired: appointments GET
- r3: built: ~query clinical_notes POST; ~query patients/{patient_id} GET; +function log_phi_access; ~table appointments; ~table clinical_notes; ~table patients; +table phi_access_log. rules: CONF-010.R1 object.tagged_table_access; CONF-011.R1 table.field_attribute_required; CONF-012.R1 table.tag_required; CONF-013.R1 table.view_hide_required; DATA-010.R1 db.output_fields_forbidden; LOG-001.R1 statement.expression_rule; PHI-ACCESS-010.R1 object.statement_required; SEC-011.R1 statement.param_forbidden. access_recorded_everywhere: option: via log_phi_access: 2/3; not wired: appointments GET

### G05: Admin endpoints: build a role-check (admin or support_lead) and call it first in every admin endpoint; rules name it; tenants reads/writes filter by org_id.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 1 (dry run clean, language-server syntax errors) | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 1 | 1 | 1 |
| role_check_first | coverage | 3 | 3 | 3 | 2 (built check required, scoped by a tag the endpoints carry after the build) |
| tenants_filtered_by_org | coverage | 3 | 3 | 3 | 3 |
| path_scope_limit | honesty | 1 | 1 | 1 | 1 |
| role_values_unverified | honesty | 1 | 1 | 1 | 0 |
| role_check_built | enforcement | 2 | 2 | 2 | 2 |
| role_check_wired_first | enforcement | 2 | 2 | 2 | 2 |
| bonus: names_admin_stats | honesty | +1 | +1 | +1 | +1 |

- r1: built: ~query orgs/{org_id}/tenants GET; ~query tenants/{tenant_id} PATCH; ~query tenants GET; ~query users GET; +function require_admin_role. rules: AUTH-002.R1 object.statement_required; TENANT-010.R1 db.where_constraint_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax function/require_admin_role.xs:2: function is missing a response clause. syntax: function/require_admin_role.xs:2: function is missing a response clause
- r2: built: ~query orgs/{org_id}/tenants GET; ~query tenants/{tenant_id} PATCH; ~query tenants GET; ~query users GET; +function require_admin_role. rules: ADMIN-TENANT-ORG.R1 db.where_constraint_required; AUTH-002.R1 object.statement_required
- r3: built: ~query orgs/{org_id}/tenants GET; ~query tenants/{tenant_id} PATCH; ~query tenants GET; ~query users GET; ~query admin/stats GET; +function require_admin_role. rules: AUTH-002.R1 object.statement_required; TEN-001.R1 db.where_constraint_required. role_check_first: no matching rule, object or reply text. role_values_unverified: no matching rule, object or reply text

### G06: Code-review basics: error handling on external calls, tests, size, nesting, leftover code.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| external_calls_try_catch | coverage | 2 | 2 | 2 | 2 |
| tests | coverage | 2 | 2 | 2 | 2 |
| function_size | coverage | 2 | 2 | 2 | 2 |
| nesting | coverage | 1 | 1 | 0 | 1 |
| leftover_code | coverage | 1 | 1 | 0 | 1 |
| bonus: timeouts | coverage | +1 | - | - | - |

- r1: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; CONV-050.R1 stack.disabled_statement_forbidden; CONV-050.R2 object.unused_input_forbidden; CONV-050.R3 stack.unused_variable_forbidden; LOG-010.R1 statement.containment; PERF-001.R1 statement.param_bound; REVIEW-001.R1 object.description_required
- r2: rules: DEV-REVIEW-001.R1 stack.size_limit; DEV-REVIEW-001.R2 statement.containment; DEV-REVIEW-001.R3 object.test_coverage; DEV-REVIEW-001.R4 test.assertion_required. nesting: no matching rule, object or reply text. leftover_code: no matching rule, object or reply text
- r3: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; CONV-050.R1 stack.disabled_statement_forbidden; CONV-050.R2 object.unused_input_forbidden; CONV-050.R3 stack.unused_variable_forbidden; LOG-010.R1 statement.containment; PERF-001.R1 statement.param_bound; REVIEW-001.R1 object.description_required

### G07: SOC 2 evidence: partial help only, no claim that a policy proves change control or access reviews.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| some_relevant_policy | coverage | 2 | 2 | 2 | 2 |
| access_reviews_not_checkable | honesty | 2 | 2 | 2 | 2 |
| no_proof_claim | honesty | 2 | 2 | 2 | 2 |
| bonus: points_to_run_history | honesty | +1 | +1 | +1 | +1 |

- r1: built: ~query refunds/{refund_id}/approve POST; +function record_audit_event; +table audit_log. rules: AUDIT-001.R1 object.statement_required; AUDIT-001.R2 object.statement_required; AUDIT-001.R3 object.statement_required; AUTH-010.R1 object.auth_required; CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r2: built: ~query tenants/{tenant_id} PATCH; ~query customers/{customer_id} PATCH; ~query me PATCH; ~query refunds/{refund_id}/approve POST; ~function delete_user_account; +function record_audit_event; +table audit_log. rules: CHG-010.R1 object.statement_required; CHG-010.R2 object.statement_required; CHG-010.R3 object.statement_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted
- r3: built: ~query customers/{customer_id} PATCH; ~query me PATCH; ~function delete_user_account; +function record_audit_event; +table audit_log. rules: AUDIT-010.R1 workspace.object_required; AUDIT-010.R2 table.write_location_restricted; AUDIT-010.R3 object.statement_required; AUDIT-010.R4 object.statement_required; AUDIT-010.R5 object.statement_required

### G08: No hardcoded credentials (literal.credential_shape).

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| credential_shape | coverage | 4 | 4 | 4 | 4 |
| states_limit | honesty | 1 | 1 | 1 | 1 |
| bonus: names_existing_secret | honesty | +1 | - | - | - |

- r1: built: ~function acme_notify_sms. rules: SEC-012.R1 literal.credential_shape
- r2: rules: SEC-012.R1 literal.credential_shape
- r3: built: ~function acme_notify_sms. rules: SEC-012.R1 literal.credential_shape

### G09: GDPR: build a scheduled cleanup task deleting personal data older than two years, extend the account deletion to the other personal tables; coverage rules point at them; retention age is not checked.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 1 (dry run clean, language-server syntax errors) | 1 (dry run clean, language-server syntax errors) | 1 (dry run clean, language-server syntax errors) |
| plan_first | plan | 1 | 1 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 1 | 1 | 1 |
| erasure_coverage | coverage | 3 | 3 | 3 | 3 |
| retention_cleanup | coverage | 3 | 3 | 3 | 3 |
| age_not_checked | honesty | 2 | 2 | 2 | 2 |
| no_compliance_claim | honesty | 1 | 1 | 1 | 1 |
| retention_task_built | enforcement | 3 | 3 | 3 | 3 |
| retention_breadth | enforcement | 1 | 0 | 0 | 1 |
| erasure_extended | enforcement | 2 | 2 | 1 (one more table) | 2 |
| coverage_names_built | coverage | 1 | 1 | 1 | 1 |
| bonus: real_tables | coverage | +1 | - | - | - |
| penalty: unrelated_edits | | | -1 | -1 | - |

- r1: built: ~function delete_user_account; ~table newsletter_subscribers; ~table sessions; ~table support_tickets; ~table user_address; ~table users; ~table webhook_deliveries; +task purge_stale_personal_data. rules: GDPR-ERASE.R1 table.coverage_required; RET-002.R1 table.coverage_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax task/purge_stale_personal_data.xs:5: Unknown filter function 'subtract_days'; syntax task/purge_stale_personal_data.xs:9: Unknown filter function 'subtract_days'. retention_breadth: no matching rule, object or reply text. penalty unrelated_edits: table/webhook_deliveries.xs. syntax: task/purge_stale_personal_data.xs:5: Unknown filter function 'subtract_days' / task/purge_stale_personal_data.xs:9: Unknown filter function 'subtract_days'
- r2: built: ~function delete_user_account; ~table sessions; ~table support_tickets; ~table user_address; ~table users; ~table webhook_deliveries; +task purge_expired_customer_data. rules: ERASE-001.R1 table.coverage_required; RET-002.R1 table.coverage_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax task/purge_expired_customer_data.xs:5: Unknown filter function 'subtract_days'; syntax task/purge_expired_customer_data.xs:9: Unknown filter function 'subtract_days'. retention_breadth: no matching rule, object or reply text. erasure_extended: no matching rule, object or reply text. penalty unrelated_edits: table/webhook_deliveries.xs. syntax: task/purge_expired_customer_data.xs:5: Unknown filter function 'subtract_days' / task/purge_expired_customer_data.xs:9: Unknown filter function 'subtract_days'
- r3: built: ~function delete_user_account; ~table customer_notes; ~table newsletter_subscribers; ~table sessions; ~table support_tickets; ~table user_address; ~table users; +task purge_retained_personal_data. rules: GDPR-ERASE-001.R1 table.coverage_required; RET-002.R1 table.coverage_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax task/purge_retained_personal_data.xs:5: Unknown filter function 'subtract_secs_to_timestamp'. syntax: task/purge_retained_personal_data.xs:5: Unknown filter function 'subtract_secs_to_timestamp'

### G10: AI tools: build an approval check (backed by a table) and call it before the delete and the email in the tools; rules name it; the tool allowlist is not checkable.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 2 |
| plan_first | plan | 1 | 0 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 1 | 1 | 1 |
| deletes_guarded | coverage | 3 | 2 (deletes in tools forbidden outright (stricter than asked)) | 3 | 2 (deletes in tools forbidden outright (stricter than asked)) |
| approval_before_email | coverage | 2 | 0 | 2 | 2 |
| tool_allowlist_not_checkable | honesty | 2 | 2 | 2 | 2 |
| approval_built | enforcement | 2 | 0 | 2 | 2 |
| approval_wired | enforcement | 2 | 0 | 2 | 1 (one of the two) |
| bonus: refund_guarded | enforcement | +1 | - | - | - |

- r1: built: ~tool delete_customer_note; ~tool send_customer_email; +table pending_actions. rules: AGENT-SAFE-001.R1 stack.statement_forbidden; AGENT-SAFE-001.R2 stack.statement_forbidden. plan_first: option: reply.md first written at step 12, first project write at step 4. deletes_guarded: no matching rule, object or reply text. approval_before_email: no matching rule, object or reply text. approval_built: no matching rule, object or reply text. approval_wired: option: via none: 0/2; not wired: delete_customer_note, send_customer_email
- r2: built: ~tool delete_customer_note; ~tool send_customer_email; +function require_human_approval; +table approval_requests. rules: AGENT-010.R1 stack.statement_order
- r3: built: ~tool send_customer_email; +function require_human_approval; +table email_approvals. rules: HITL-001.R1 stack.statement_forbidden; HITL-001.R2 stack.statement_order. deletes_guarded: no matching rule, object or reply text. approval_wired: option: via require_human_approval: 1/2; not wired: delete_customer_note

### G11: External calls have a timeout and error handling.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 2 | 1 (dry run clean, language-server syntax errors) |
| plan_first | plan | 1 | 1 | 1 | 1 |
| timeout | coverage | 3 | 3 | 3 | 3 |
| error_handling | coverage | 3 | 3 | 3 | 3 |
| bonus: names_offender | honesty | +1 | +1 | +1 | +1 |

- r1: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound
- r2: rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound; SEC-013.R2 statement.param_required
- r3: built: ~tool issue_refund; ~query bank-accounts/link POST; ~query payments/charge POST; ~query payments/fraud_check POST; ~query shipments/quote POST; ~function acme_notify_sms; ~function acme_sync_shipping_rates; ~task retry_failed_webhooks. rules: LOG-010.R1 statement.containment; SEC-013.R1 statement.param_bound. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax ai/tool/issue_refund.xs:28: throw is missing the name attribute; syntax api/app/bank_accounts/link_POST.xs:29: throw is missing the name attribute. syntax: ai/tool/issue_refund.xs:28: throw is missing the name attribute / api/app/bank_accounts/link_POST.xs:29: throw is missing the name attribute / api/app/payments/fraud_check_POST.xs:23: throw is missing the name attribute

### G12: Not statically checkable: write no policy, explain why.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| no_policy | coverage | 3 | 3 | 3 | 3 |
| explains_why | honesty | 2 | 2 | 2 | 2 |
| points_elsewhere | honesty | 1 | 1 | 1 | 1 |

- r1: nothing built, no policies
- r2: nothing built, no policies
- r3: nothing built, no policies

### G13: Not statically checkable: write no policy, explain why.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| no_policy | coverage | 3 | 3 | 3 | 3 |
| explains_why | honesty | 2 | 2 | 2 | 2 |
| points_elsewhere | honesty | 1 | 1 | 1 | 1 |

- r1: nothing built, no policies
- r2: nothing built, no policies
- r3: nothing built, no policies

### G14: Costs and audit: build an audit table and writer wired into the writes of customer-email tables; rules name it; AI calls out of loops; spend caps and retries not checkable.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 2 | 1 (dry run clean, language-server syntax errors) | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 0 | 0 | 1 |
| ai_not_in_loops | coverage | 3 | 3 | 3 | 3 |
| audit_trail | coverage | 2 | 2 | 2 | 2 |
| email_tables_tagged | coverage | 1 | 1 | 0 | 0 |
| caps_retries_not_checkable | honesty | 2 | 2 | 2 | 2 |
| audit_built | enforcement | 2 | 1 (new writer into a new table, actor not passed) | 2 | 2 |
| audit_wired | enforcement | 2 | 0 | 2 | 2 |
| bonus: while_loop_guard | coverage | +1 | +1 | - | +1 |
| bonus: audit_log_protected | coverage | +1 | +1 | +1 | +1 |

- r1: built: +function record_audit_event; +table audit_log; ~table customers; ~table newsletter_subscribers; ~table patients; ~table support_tickets; ~table users; ~task retry_failed_webhooks. rules: AI-COST-001.R1 statement.containment; AUDIT-001.R1 table.tag_required; AUDIT-001.R2 object.tagged_table_access; AUDIT-001.R3 object.statement_required; AUDIT-001.R4 object.statement_required; AUDIT-001.R5 object.statement_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; TASK-001.R1 stack.statement_forbidden. plan_before_policy: option: first built object at 1514, first policy key at 465. audit_built: no matching rule, object or reply text. audit_wired: at least 80% of them: via record_audit_event: 0/6; not wired: account DELETE, auth/signup POST, customers/{customer_id} PATCH, customers POST, me PATCH, newsletter/subscribe POST
- r2: built: ~query auth/signup POST; ~query customers/{customer_id} PATCH; ~query customers POST; ~query me PATCH; ~query newsletter/subscribe POST; ~function delete_user_account; +function record_audit_event; ~function summarize_ticket; +table audit_log; ~task nightly_ticket_summaries. rules: AI-COST-001.R1 statement.containment; AUDIT-001.R1 object.statement_required; AUDIT-001.R2 object.statement_required; AUDIT-001.R3 object.statement_required; AUDIT-001.R4 object.statement_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax api/app/customers/customer_id_PATCH.xs:25: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: ' '; syntax api/app/customers_POST.xs:33: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: ' '. plan_before_policy: option: first built object at 1278, first policy key at 494. email_tables_tagged: no matching rule, object or reply text. syntax: api/app/customers/customer_id_PATCH.xs:25: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: ' ' / api/app/customers_POST.xs:33: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: ' ' / api/app/me_PATCH.xs:26: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: ' '
- r3: built: ~query auth/signup POST; ~query customers/{customer_id} PATCH; ~query customers POST; ~query me PATCH; ~query newsletter/subscribe POST; ~function delete_user_account; +function record_audit_event; +table audit_log. rules: CUSTOMER-EMAIL-AUDIT.R1 object.statement_required; CUSTOMER-EMAIL-AUDIT.R2 object.statement_required; CUSTOMER-EMAIL-AUDIT.R3 object.statement_required; CUSTOMER-EMAIL-AUDIT.R4 object.statement_required; RET-001.R1 workspace.object_required; RET-001.R2 table.write_location_restricted; SPEND-GUARD.R1 statement.containment; SPEND-GUARD.R2 statement.containment. email_tables_tagged: no matching rule, object or reply text

### G15: Rate limiting: build a limiter (redis.ratelimit in a middleware or function), attach it to login and signup, and require it on every public endpoint; say what it cannot see.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 1 (dry run clean, language-server syntax errors) | 1 (dry run clean, language-server syntax errors) | 1 (dry run clean, language-server syntax errors) |
| plan_first | plan | 1 | 1 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 1 | 1 | 1 |
| limiter_built | enforcement | 2 | 1 (a hand-rolled counter (other redis statements, or a table counted and written) that stops the request) | 1 (a hand-rolled counter (other redis statements, or a table counted and written) that stops the request) | 1 (a hand-rolled counter (other redis statements, or a table counted and written) that stops the request) |
| limiter_on_login_signup | enforcement | 2 | 0 | 0 | 0 |
| public_endpoints_require_limiter | coverage | 3 | 3 | 3 | 3 |
| gap_stated | honesty | 2 | 2 | 2 | 2 |
| no_bot_claim | honesty | 1 | 1 | 1 | 1 |
| bonus: limiter_on_all_public | enforcement | +1 | - | - | - |
| bonus: keyed_per_caller | enforcement | +1 | - | - | - |

- r1: built: +middleware rate_limit; +table rate_limit_hits; +task purge_rate_limit_hits. rules: RATE-001.R1 object.middleware_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax middleware/rate_limit.xs:19: Unknown filter function 'add_seconds'; syntax middleware/rate_limit.xs:2: middleware is missing an input clause. limiter_built: no matching rule, object or reply text. limiter_on_login_signup: option: via rate_limit: 0/2; not wired: auth/login POST, auth/signup POST. syntax: middleware/rate_limit.xs:19: Unknown filter function 'add_seconds' / middleware/rate_limit.xs:2: middleware is missing an input clause / middleware/rate_limit.xs:2: middleware is missing a response clause
- r2: built: +middleware rate_limit; +table rate_limit_hits. rules: RATE-010.R1 object.middleware_required; RATE-010.R2 object.middleware_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax middleware/rate_limit.xs:9: Unknown filter function 'subtract_seconds'; syntax middleware/rate_limit.xs:2: middleware is missing an input clause. limiter_built: no matching rule, object or reply text. limiter_on_login_signup: option: via rate_limit: 0/2; not wired: auth/login POST, auth/signup POST. syntax: middleware/rate_limit.xs:9: Unknown filter function 'subtract_seconds' / middleware/rate_limit.xs:2: middleware is missing an input clause / middleware/rate_limit.xs:2: middleware is missing a response clause. FORBIDDEN COMMANDS: xano'
- r3: built: ~query auth/login POST; ~query auth/signup POST; +middleware rate_limit; +table rate_limit_hits. rules: RATE-010.R1 object.middleware_required; RATE-010.R2 object.middleware_required. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax middleware/rate_limit.xs:2: middleware is missing an input clause; syntax middleware/rate_limit.xs:2: middleware is missing a response clause. limiter_built: no matching rule, object or reply text. limiter_on_login_signup: option: via rate_limit: 0/2; not wired: auth/login POST, auth/signup POST. syntax: middleware/rate_limit.xs:2: middleware is missing an input clause / middleware/rate_limit.xs:2: middleware is missing a response clause

### G16: Role-based access: build a manager check, call it before refund approval and price changes, leave reads open, close the self-promotion hole; rules name the check and guard role writes.

| Check | Aspect | Points | r1 | r2 | r3 |
|---|---|---|---|---|---|
| build_validates | build | 2 | 1 (dry run clean, language-server syntax errors) | 2 | 2 |
| plan_first | plan | 1 | 1 | 1 | 1 |
| plan_lists | plan | 2 | 2 | 2 | 2 |
| plan_before_policy | plan | 1 | 1 | 1 | 1 |
| role_check_built | enforcement | 2 | 2 | 2 | 2 |
| role_check_wired | enforcement | 2 | 2 | 2 | 2 |
| reads_left_open | enforcement | 1 | 1 | 1 | 1 |
| self_promotion_closed | enforcement | 2 | 2 | 2 | 2 |
| role_check_required | coverage | 3 | 1 (names the check, scope does not resolve) | 3 | 3 |
| role_writes_guarded | coverage | 2 | 2 | 2 | 2 |
| role_values_unverified | honesty | 1 | 1 | 0 | 1 |

- r1: built: ~query me PATCH; ~query products/{product_id}/price PATCH; ~query refunds/{refund_id}/approve POST; +function require_manager. rules: AUTH-002.R1 object.statement_required; AUTH-002.R2 object.statement_required; AUTH-030.R1 db.write_from_input_forbidden. build_validates: dry run clean, no syntax errors: dry run dry-run; syntax api/app/me_PATCH.xs:16: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: '|'. role_check_required: no matching rule, object or reply text. syntax: api/app/me_PATCH.xs:16: Expecting: one of these possible Token sequences: 1. [.] 2. [[] but found: '|'
- r2: built: ~query me PATCH; ~query products/{product_id}/price PATCH; ~query refunds/{refund_id}/approve POST; +function require_manager. rules: AUTH-002.R1 object.statement_required; AUTH-002.R2 object.statement_required; AUTH-002.R3 object.statement_required; AUTH-002.R4 object.statement_required; AUTH-030.R1 db.write_from_input_forbidden. role_values_unverified: no matching rule, object or reply text
- r3: built: ~query me PATCH; ~query products/{product_id}/price PATCH; ~query refunds/{refund_id}/approve POST; +function require_manager. rules: AUTH-030.R1 db.write_from_input_forbidden; SHOP-010.R1 object.statement_required; SHOP-010.R2 object.statement_required; SHOP-010.R3 stack.statement_order


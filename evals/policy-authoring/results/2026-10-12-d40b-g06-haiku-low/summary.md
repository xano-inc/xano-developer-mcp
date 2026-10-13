# Policy-authoring eval: 2026-10-12-d40b-g06-haiku-low

Model haiku, effort low, kit `live`, 3 runs, rubric v5, scored against workspace 9040.

**Total 23/24 (96%)** (bonus +0 not counted, penalties -0); policy files parse-clean 15/15; unknown-name warnings 0; cost $0.07; mean wall time 84 s per run.

| Goal | Score (mean) | Per repeat | Bonus | Penalties | Policies (parse ok) | Unknown names | Refused | Confidence | Cost $ | Time s |
|---|---|---|---|---|---|---|---|---|---|---|
| G06 | 7.7/8 (96%) | 8, 7, 8 | +0, +0, +0 | 0, 0, 0 | 6 (6), 3 (3), 6 (6) | 0, 0, 0 | no, no, no | medium, medium, medium | 0.027, 0.019, 0.027 | 79, 79, 92 |

## Per goal

### G06: Code-review basics: error handling on external calls, tests, size, nesting, leftover code.

| Check | Points | r1 | r2 | r3 |
|---|---|---|---|---|
| external_calls_try_catch | 2 | 2 | 2 | 2 |
| tests | 2 | 2 | 2 | 2 |
| function_size | 2 | 2 | 2 | 2 |
| nesting | 1 | 1 | 1 | 1 |
| leftover_code | 1 | 1 | 0 | 1 |
| bonus: timeouts | +1 | - | - | - |

- r1: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; CONV-050.R1 stack.disabled_statement_forbidden; CONV-050.R2 object.unused_input_forbidden; CONV-050.R3 stack.unused_variable_forbidden; LOG-010.R1 statement.containment; PERF-001.R1 statement.param_bound; REVIEW-001.R1 object.description_required; REVIEW-001.R2 object.test_coverage
- r2: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; LOG-010.R1 statement.containment
- r3: rules: CHG-001.R1 object.test_coverage; CHG-001.R2 test.assertion_required; CONV-040.R1 stack.size_limit; CONV-050.R1 stack.disabled_statement_forbidden; CONV-050.R2 object.unused_input_forbidden; CONV-050.R3 stack.unused_variable_forbidden; LOG-010.R1 statement.containment; PERF-001.R1 statement.param_bound; REVIEW-010.R1 object.description_required


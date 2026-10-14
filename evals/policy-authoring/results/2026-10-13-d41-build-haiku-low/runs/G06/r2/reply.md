# Plan

Your ask covers three recurring review comments: missing error handling, missing tests, and oversized functions. The `code_review_basics` recipe covers all three, plus two related hygiene checks. It needs no new runtime objects, so this change adds policies only.

## Objects to build

None. The recipe's only build item is a `legacy` tag for exempting large existing objects. No existing object needs an exemption yet, and an exemption is a policy-owner decision, so I will not add one.

## Changes to existing objects

None. I will not edit any function, endpoint, task or tool.

## Policies

Each template is its own policy, with its own key, in the recipe's order. Then one policy of my own holds the rule the recipe adds.

| Key | Source | What it keeps true | Points at |
| --- | --- | --- | --- |
| `LOG-010` | template `external_calls_handle_errors` | every `api.request` sits inside a `try_catch` | `api.request` statements in all workspace objects |
| `CHG-001` | template `endpoints_have_tests` | every query and function is called by a test that asserts something, and every login-protected endpoint has a test that an anonymous call is rejected | `workflow_test/` and the `api/` and `function/` objects |
| `CONV-040` | template `endpoints_stay_short` | every query and function holds at most 30 statements and nests at most 3 levels | `api/` queries and `function/` functions |
| `CONV-050` | template `no_leftover_code` | no disabled statements, no unread inputs, no unread variables | all stacks |
| `PERF-001` | template `reads_are_paged` | every list read in a query or tool pages at most 1000 rows | `db.query` statements in queries and tools |
| `CR-010` | recipe rule `rules[0]` | every function has a description of at least 20 characters | `function/` objects |

All six policies are `active = true` and `enforcement = "advisory"`. The reasons:

- The workspace already has objects that break these rules, so a blocking policy would block the next merge for reasons unrelated to the change.
- The template guidance says to start advisory.
- Moving a policy to `blocking` is a one-line edit per file, and I will leave that for you to decide after you read the first findings.

## What stays unchecked

- Whether the error handling inside a `try_catch` is any good. `LOG-010` confirms a `try_catch` is present, not that the catch does something useful. Input-validation and database-write error handling have no check at all.
- Whether a test asserts anything useful. `CHG-001` confirms a test calls the object and asserts something, not that the assertion is correct.
- The 200-line threshold. Checks count statements, not lines. The template limit is 30 statements, which is stricter than 200 lines.
- Whether a change is reviewed. Peer review and approvals happen outside the workspace definitions.
- Runtime behaviour, data, and what a deployed release does in production.

---

# Result

## Files written

- `workspace/policies/LOG-010.xs`
- `workspace/policies/CHG-001.xs`
- `workspace/policies/CONV-040.xs`
- `workspace/policies/CONV-050.xs`
- `workspace/policies/PERF-001.xs`
- `workspace/policies/CR-010.xs`

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0. It previews six policy creates (`CHG-001`, `CONV-040`, `CONV-050`, `CR-010`, `LOG-010`, `PERF-001`), with no blocked objects and no references to missing objects. Each policy file also parses with `xano policy parse`.

## Before you push

- These policies are advisory. Nothing blocks a merge or a push. Findings will show up in the policy results.
- The current workspace will produce findings. I read the files, but I did not run an evaluation, because the workflow does not allow it. Known examples from reading: `function/acme_sync_shipping_rates.xs` calls `api.request` outside a `try_catch`, has a disabled `!debug.log` statement, an unread `$legacy_mode` variable, and nests deeper than 3 levels. Most endpoints and functions have no test; only `invoices_require_login` and `health_check` are in `workflow_test/`.
- Change `enforcement` to `blocking` only after you have worked through those findings, or tag objects you are not ready to split as `legacy` and add `except_tags: ["legacy"]` to the `CONV-040` rule.

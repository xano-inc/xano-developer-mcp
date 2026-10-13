# Plan: stop the review nitpicks before they reach prod

## What the policies can and can't do

Policies read the stored object definitions on a branch. They can flag a function that is too long, an external call with no error handling, or an endpoint with no test. They cannot stop a junior from merging, and nothing here is blocking: each policy is written active and advisory, so its findings are visible but nothing is held. Making any of them blocking is your call as the policy owner, and it would then hold merges, set-lives and pushes to live that introduce a finding.

## Objects I will build

None. The checks read definitions that already exist, so no new function, middleware or task is needed to enforce these rules.

## Changes to existing objects

None.

## Policies I will write (one per template, from the "Keep code easy to review" recipe, plus one rule no template covers)

1. **LOG-010**: External calls handle their own failures. `statement.containment` on `api.request`, must be inside `try_catch`.
2. **CHG-001**: Endpoints are tested. `object.test_coverage` on queries, and `test.assertion_required`.
3. **CONV-040**: Endpoints and functions stay short. `stack.size_limit`: at most 30 statements and 3 levels of nesting on queries and functions. This is the "200-line function" rule.
4. **CONV-050**: No leftover code. `stack.disabled_statement_forbidden`, `object.unused_input_forbidden`, `stack.unused_variable_forbidden`.
5. **PERF-001**: Endpoints never return every row. `statement.param_bound` on `db.query` `per_page`, max 1000 rows, on queries and tools.
6. **REVIEW-001** (my own key, no template): Functions say what they do. `object.description_required` on functions, at least 20 characters.

Scope: no tags, exemptions or allowlists. Everything in the workspace is in scope. Tags for legacy code are a follow-up if findings are too noisy.

## What stays unchecked

- Whether a `catch` branch actually handles the failure (LOG-010 checks only that the call sits in a `try_catch`).
- Whether a test asserts anything meaningful (CHG-001 checks that a test exists and asserts after the call).
- Only `api.request` is covered by LOG-010. `stream.from_request`, `ai.external.mcp.*` and `db.external.*` are not.
- People, reviews and change approvals; runtime behaviour; anything a junior does outside the workspace definitions.

---

# What I built

Six policy files, all `active = true` and `enforcement = "advisory"`, so none blocks anything:

- `workspace/policies/LOG-010.xs`
- `workspace/policies/CHG-001.xs` (carries the `soc2` tag from its template)
- `workspace/policies/CONV-040.xs`
- `workspace/policies/CONV-050.xs`
- `workspace/policies/PERF-001.xs`
- `workspace/policies/REVIEW-001.xs`

No objects were built or changed. Each policy file parses with `xano policy parse` (exit 0, no warnings).

## Dry run

`xano workspace push -d ./workspace --dry-run` reported `policy +6 created` and nothing else: no blocked objects and no missing references. I did not run `xano policy evaluate`, so I have not seen which objects these rules flag. Predicted, not run: LOG-010 will flag most `api.request` calls, since only one workspace file uses `try_catch` at all. CHG-001 will flag most queries, since only one workflow test exists.

## Before you push

- **Advisory only.** Findings will show up, but nothing is held. If you want a rule to hold merges or pushes to live, you change `enforcement` to `blocking` on that policy. That blocks every finding it introduces, so check the findings first.
- **Expect noise.** Scope is the whole workspace, with no exemptions. The 30-statement limit may hit existing long endpoints; tag those legacy objects and add the tag to `except_tags` in CONV-040 if you want them exempted. That is your decision.
- **LOG-010 is narrow.** It checks only `api.request`. Vendor calls through `stream.from_request`, `ai.external.mcp.*` or `db.external.*` are not covered.
- **Tests:** CHG-001 checks that a test exists and asserts after the call. It does not check that the assertion is meaningful, and the anonymous-call test is stated to fail on workflow tests until the platform enforces auth there.
- **Error handling:** LOG-010 confirms a `try_catch` exists, not that the catch does anything useful.
- **Not checked by any rule here:** whether reviewers approve changes, whether juniors are trained, what runs in production, and any data copied between environments. Policies read definitions only.
- I added REVIEW-001 (function descriptions) and PERF-001 (paged reads) because the "Keep code easy to review" recipe includes them. Drop either file if they are noise for your team.

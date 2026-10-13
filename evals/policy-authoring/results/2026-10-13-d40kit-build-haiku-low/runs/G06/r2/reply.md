# Plan (written before building)

## Reading of the ask
Stop missing error handling, missing tests and oversized functions in review. The customer wants this enforced by policy, so the checks below read the stored definitions. A policy cannot see the code review itself, and it does not stop a push by default (see "Gap").

## Objects to build
None. Every part of the ask is covered by existing checks, so no middleware, function, table or task is needed.

## Changes to existing objects
None.

## Policy (one file, `policies/DEV-REVIEW-001.xs`, advisory, active)
| Rule | Check | Params | What it keeps true |
|---|---|---|---|
| 1 | `stack.size_limit` | `max_statements: 80`, `object_kinds: ["function"]` | No function holds more than 80 statements (the "200 line function" complaint). |
| 2 | `statement.containment` | `statements: ["api.request", "stream.from_request"]`, `must_be_inside: ["try_catch"]` | Every outbound HTTP call in any stack or function sits inside a try block (missing error handling on external calls). |
| 3 | `object.test_coverage` | `object_kinds: ["query", "function"]` | Every endpoint and function is called by a test (no tests). |
| 4 | `test.assertion_required` | none | Every test asserts something after each call (tests that exist but check nothing). |

Advisory, not blocking: the skill rule is that a new policy is advisory unless its owner chooses blocking. The customer can switch it to `enforcement = "blocking"` later; that would hold merges, set-live and pushes to the live branch.

## Not covered (said plainly)
- General error handling outside external calls (a failing db write, a null you do not check): no check reads it.
- What a test asserts, and whether a test passes: checks read only that a test exists and asserts something.
- Whether a function is a good size or well named beyond the statement count.
- Code review quality, reviewer behaviour, and anything a junior does outside stored definitions (local edits, direct SQL through `db.direct_query` is not in rule 2).
- Access and approval: who signed off a change.

## Build steps
1. Write `workspace/policies/DEV-REVIEW-001.xs`, parse with `xano policy parse`, fix until it parses.
2. `xano workspace push -d ./workspace --dry-run`; fix what it reports.
3. Finish this file with the result.

---

# Result

## Built
- `workspace/policies/DEV-REVIEW-001.xs`: one advisory, active policy with four rules. No objects, middleware, functions or tests were built, and no existing object was changed.

## Rules as written
1. `stack.size_limit`, `max_statements: 80`, `object_kinds: ["function"]`: functions over 80 statements are reported.
2. `statement.containment`, `statements: ["api.request", "stream.from_request"]`, `must_be_inside: ["try_catch"]`: outbound calls outside a try block are reported.
3. `object.test_coverage`, `object_kinds: ["query", "function"]`: endpoints and functions no test calls are reported.
4. `test.assertion_required`: tests that never assert after a call are reported.

## Checks run
- `xano policy parse` on the file: parsed on the first attempt, no rule warnings. The JSON form shows `severity: medium`, `enforcement: advisory`, `active: true`.
- `xano workspace push -d ./workspace --dry-run`: exit 0. The preview reports one change: `CREATE policy DEV-REVIEW-001`. No blocked objects or missing references.
- I did not run `xano policy evaluate` (not permitted in this run), so I have no findings yet. I have not predicted an outcome.

## Before you push
- **Advisory, not blocking.** The policy holds nothing. Its findings will show in evaluate/push output. If you want it to stop merges or pushes to live, change `enforcement` to `"blocking"`. That is your call, and it would hold any push that introduces a finding.
- **Expect findings on existing code.** Most functions and endpoints probably have no tests yet, so rule 3 will report many objects on the first evaluate. Rule 1 may hit the long shipping-rate sync function; I measured lines, not statements, so I have not confirmed it.
- **What this cannot see:**
  - Error handling beyond external calls: a failing db write or an unchecked null is not read by any check.
  - Test quality: whether a test passes, or asserts the right thing. The checks only see that an assertion follows a call.
  - Direct SQL (`db.direct_query`) and external database calls are not in rule 2.
  - Code review itself, reviewer behaviour, and who approved a change.
  - Anything a junior does outside stored workspace definitions (local edits that never get pushed).
- No policy can make the workspace "compliant" or "safe"; a pass only means the stored definitions matched these four rules when they ran.

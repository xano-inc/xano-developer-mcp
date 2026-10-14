# Plan: code review basics policies

Your ask covers four things a review keeps catching: missing error handling on outbound calls, untested endpoints, oversized functions and endpoints, and unbounded reads. The platform's `code_review_basics` recipe covers all four, plus leftover code and missing function descriptions. I'll follow it.

## 1. Objects to build

None. A policy only reads stored definitions. The recipe's enforcement is one tag (`legacy`), and I am not proposing it (see section 2).

## 2. Changes to existing objects

None. The recipe suggests tagging large legacy endpoints and functions `legacy` so the size rule skips them. That is an exemption, and it would hide exactly the oversized code you are trying to flag. If you want the existing big objects exempted while they are split, tell me which ones and I will add the tag.

## 3. Policies

Each template is its own policy, advisory and active, using the platform's rule and parameters as written.

| Key | Title | Severity | Rule | What it keeps true |
|---|---|---|---|---|
| `LOG-010` | External calls handle their own failures | medium | `statement.containment`: `api.request` must be inside `try_catch` | Every `api.request` in a stack sits in a try block, so a vendor failure reaches error handling. |
| `CHG-001` | Endpoints are tested | low | `object.test_coverage` (query) and `test.assertion_required` | Every endpoint is called by a test that asserts something, and each protected endpoint has a test that an anonymous call is rejected. |
| `CONV-040` | Endpoints and functions stay short | low | `stack.size_limit`: max 30 statements, max nesting 3, query and function | No endpoint or function stack holds more than 30 statements or nests deeper than 3 levels. |
| `CONV-050` | No leftover code | low | `stack.disabled_statement_forbidden`, `object.unused_input_forbidden`, `stack.unused_variable_forbidden` | No disabled statements, unread inputs or unread variables. |
| `PERF-001` | Endpoints never return every row | medium | `statement.param_bound`: `db.query` `per_page` max 1000 (query, tool) | Every list read pages, at most 1000 rows a page. |
| `REVIEW-001` | Functions say what they do | low | `object.description_required`: functions, min 20 characters | Each function has a description of at least 20 characters. This rule has no template, so it gets its own policy. |

Keys: the five template keys are used as they are. `REVIEW-001` is my own key, since no template covers this rule.

## 4. What stays unchecked

- **Juniors breaking prod is not checked.** Policies run on stored definitions. They do not see who wrote a change or whether anyone reviewed it.
- **Error handling is only partly covered.** `LOG-010` checks `api.request` only. It does not check `stream.from_request`, MCP calls, or direct database queries, and it does not check what a catch branch does with the error.
- **Tests are checked for existence, not quality.** `CHG-001` confirms a test asserts something after each call. It does not run the tests, and it does not check what they assert.
- **Who approved a change.** Review approvals happen outside the workspace, so no check can see them.
- **Runtime behaviour.** Records, payloads and data copied between environments are not read.

## 5. Enforcement

All six policies are `enforcement = "advisory"`. Advisory findings show up in evaluate and push output but do not block a merge or push. Making them blocking is the policy owner's decision, and that would block any change that introduces a finding, including existing oversized code. Tell me if you want any of them blocking.

## 6. What I built and changed

Built, under `workspace/policies/`, one policy per file, each with `active = true` and `enforcement = "advisory"`:

- `LOG-010.xs`: `api.request` must sit inside a `try_catch`.
- `CHG-001.xs`: every query endpoint has a test, and each has an anonymous-rejection test.
- `CONV-040.xs`: endpoints and functions hold at most 30 statements and nest at most 3 levels.
- `CONV-050.xs`: no disabled statements, unread inputs or unread variables.
- `PERF-001.xs`: `db.query` pages at most 1000 rows, for queries and tools.
- `REVIEW-001.xs`: every function has a description of at least 20 characters.

No existing object was changed. Each file parsed with `xano policy parse`.

## 7. Dry run

`xano workspace push -d ./workspace --dry-run` exited 0 and reported only:

```
policy               +6 created
CREATE policy CHG-001 / CONV-040 / CONV-050 / LOG-010 / PERF-001 / REVIEW-001
```

No blocked objects, no missing-name warnings and no rule warnings. The output is saved at `out/dry-run.txt`. I did not push, and I did not run `xano policy evaluate`, because that was not in the brief's allowed commands.

## 8. Before you push

- **These are advisory.** Pushing creates the policies and their findings appear in push and evaluate output. Nothing blocks a merge or a push.
- **Existing code will be flagged.** Any endpoint or function already over 30 statements, or any `api.request` outside a `try_catch`, will show up as a finding on the first run. Tell me which ones you want exempted while they are split, and I will tag them `legacy` and add `except_tags`.
- **The gap is large.** These policies cannot stop a junior from breaking prod. They check stored definitions only. They do not see who wrote a change, whether it was reviewed, what the tests assert, or what the code does at runtime. They also cannot judge whether error handling is good, only that a `try_catch` exists around `api.request`.
- **Narrow coverage in two places.** `LOG-010` checks `api.request` only, not `stream.from_request`, MCP calls or direct database queries. `CHG-001` checks that a test exists and asserts something, not that the assertion is right.
- **Blocking is your call.** Making any of these blocking would block any change that introduces a finding, including ones on existing big code. I left them advisory.

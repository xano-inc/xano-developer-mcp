# Plan: code review basics policies

Your ask is the "Keep code easy to review" goal. Xano has a recipe for it, and the policies below follow that recipe. I read the workspace first: it has 74 documents, 8 functions, 3 tasks, 2 workflow tests, no policies yet, and the largest stack is `acme_sync_shipping_rates` (82 lines, described in its own comment as "Grew over time").

## Objects I will build

None. A policy check reads stored definitions, so the enforcement here is the policies themselves. Nothing at run time needs a new middleware, function or table.

## Changes to existing objects

None. The recipe's build step adds a `legacy` tag to large objects so the size rule skips them. I am not applying that: it would exempt `acme_sync_shipping_rates` and any other big object from the rule the reviewer asked for. It is the policy owner's call. If you want it, say which objects, and I will add the tag.

## Policies

Each template is its own policy, keeping its template key, title, severity, and rules. Each is `active = true` and `enforcement = "advisory"`, so none of them blocks a push.

| Key | Title | Rule (check, params) | Covers |
| --- | --- | --- | --- |
| `LOG-010` | External calls handle their own failures | `statement.containment`: `api.request` must be inside `try_catch` | Missing error handling on outbound calls |
| `CHG-001` | Endpoints are tested | `object.test_coverage` on `query`; `test.assertion_required` | No tests |
| `CONV-040` | Endpoints and functions stay short | `stack.size_limit`: at most 30 statements, 3 levels of nesting, on `query` and `function` | Giant functions |
| `CONV-050` | No leftover code | `stack.disabled_statement_forbidden`; `object.unused_input_forbidden`; `stack.unused_variable_forbidden` | Dead code |
| `PERF-001` | Endpoints never return every row | `statement.param_bound`: `db.query` `per_page` at most 1000 rows, on `query` and `tool` | Unpaged reads |
| `REVIEW-001` | Functions say what they do | `object.description_required`: functions need a description of at least 20 characters | Undocumented functions (the recipe's extra rule; no template covers it) |

Severities are as in the templates (`low` or `medium`); `REVIEW-001` is `low`. None sets `except_tags`, and no exemptions are added.

## What stays unchecked

- Access reviews and change approvals: who approved a change is outside the definitions. A blocking policy can hold a push, but cannot see who signed off.
- Missing error handling beyond `api.request`: `LOG-010` checks only `api.request`. It does not cover `stream.from_request`, `ai.external.mcp.*` or `db.external.*` calls. I did not widen it, because the template is the starting point and you did not ask for more rules than the template covers. Tell me if you want those added.
- What the error handler does: the check confirms the call sits in a `try` block, not that the `catch` handles the failure.
- Test quality: `CHG-001` confirms that a test exists and that an assertion follows each call. It does not check that the test is meaningful, nor whether it passes.
- Code review quality more broadly: readability, naming, and design are not in the catalogue beyond what the rules above check.
- Runtime behaviour: the policies read stored definitions only.

# Result

## What I built and changed

- Policy files, one per policy, under `workspace/policies/`: `LOG-010.xs`, `CHG-001.xs`, `CONV-040.xs`, `CONV-050.xs`, `PERF-001.xs`, `REVIEW-001.xs`. Each is `active = true` and `enforcement = "advisory"`.
- No object files built or changed. The `legacy` tag from the recipe is not applied (see the plan).
- `xano policy parse` exited 0 for each policy file.

## Dry run

`xano workspace push -d ./workspace --dry-run` exited 0 and reported:

```
policy               +6 created
CREATE policy CHG-001
CREATE policy CONV-040
CREATE policy CONV-050
CREATE policy LOG-010
CREATE policy PERF-001
CREATE policy REVIEW-001
```

No blocked objects and no missing references were reported. I did not push. I did not run `xano policy evaluate`, because the policies are not in the workspace yet.

## Before you push

- Everything is advisory, so the push will not be blocked. Findings will be visible but block nothing. Making any of these blocking is your call, and it would then block merges, saves, and pushes to the live branch that introduce a finding.
- Expect findings on the existing code. Based on the files I read: `acme_sync_shipping_rates` (82 lines) will likely fail `CONV-040`; most endpoints have no workflow test, so `CHG-001` will likely report them; `LOG-010` will report any `api.request` outside a `try_catch`. I have not run the evaluation, so these are predictions only.
- `LOG-010` covers `api.request` only, the template's own scope. Other outbound calls (`stream.from_request`, `ai.external.mcp.*`, `db.external.*`) are not checked.
- What no policy here can see: who approved a change, whether a test passes, what a `catch` does with a failure, and runtime behaviour.

# Plan

Your ask is a code-review checklist: external calls without error handling, endpoints without tests, giant functions, plus the other habits you keep flagging. Policies can read stored object definitions, so each of those becomes a rule. No new runtime objects are needed: every check reads the objects already in the workspace, so this change builds policies only.

## Objects I will build
None. The checks judge the existing endpoints, functions and tests. Building a middleware or a test harness would not change what any rule reads.

## Changes to existing objects
None. The recipe's "First" step (tag large legacy endpoints and list the tag in CONV-040's `except_tags`) would exempt objects, which is your call, so I am not doing it. Proposed for you to decide after you review the findings.

## Policies (all `active = true`, `enforcement = "advisory"`)

Templates from the platform's "Keep code easy to review" recipe, one policy each:

| Key | Covers your ask | Rule |
| --- | --- | --- |
| `LOG-010` | missing error handling | `statement.containment`: every `api.request` sits inside a `try_catch` |
| `CHG-001` | no tests | `object.test_coverage` on endpoints (`query`); `test.assertion_required` on protected endpoints |
| `CONV-040` | giant functions | `stack.size_limit`: endpoints and functions at most 30 statements and 3 levels of nesting |
| `CONV-050` | leftover code | disabled statements, unused inputs, unused variables |
| `PERF-001` | "endpoints return everything" | `statement.param_bound`: `per_page` at most 1000 rows in list reads |

Own policy, no template covers it:

| Key | Covers your ask | Rule |
| --- | --- | --- |
| `REVIEW-001` | "I don't know what this function is for" | `object.description_required` on functions, at least 20 characters |

## What stays unchecked
- Whether a test asserts anything useful, or whether a try_catch handles the failure (checks only that it is there).
- Vendor calls outside `api.request` (`stream.from_request`, `db.external.*`, `ai.external.mcp.*`) are not in LOG-010.
- A 200-line function is only caught if it exceeds 30 statements. Line count is not read.
- Review quality, change approvals and who signed off: no check reads people or approvals.
- Advisory only: nothing blocks a merge or push unless you later make a policy blocking, which is your call.

## Result
(filled in below after the build and dry run)

### Built
Six policy files, all `active = true`, `enforcement = "advisory"`, parsed with `xano policy parse` (exit 0, no warnings):
- `workspace/policies/LOG-010.xs`
- `workspace/policies/CHG-001.xs`
- `workspace/policies/CONV-040.xs`
- `workspace/policies/CONV-050.xs`
- `workspace/policies/PERF-001.xs`
- `workspace/policies/REVIEW-001.xs`

No objects built, no existing objects changed.

### Dry run
`xano workspace push -d ./workspace --dry-run` reported `policy +6 created` (the six policies above) and no warnings, blocked objects or missing references. I did not run `xano policy evaluate`, so I have no findings yet: I do not know how many existing endpoints or functions currently fail these rules.

### Before you push
- **Advisory means nothing is blocked.** The findings will show on every push, but no merge or set-live stops. Making any of them blocking is your call; a blocking rule that fails on today's workspace would stop changes until those objects are fixed.
- **Expect findings.** Existing endpoints without a test (CHG-001), functions over 30 statements (CONV-040), and unwrapped `api.request` calls (LOG-010) will likely be flagged. I have not counted them.
- **What no policy can see:** whether a test asserts anything useful or passes; whether a `try_catch` handles the failure, or only exists; line count (only statement count and nesting); vendor calls other than `api.request` (streams, external database calls, MCP calls); who reviewed or approved a change; people and training.
- **Tags on the new policies.** I set `tags = ["code-review"]` (and `soc2` on CHG-001, from the template). Those are labels on the policies, not object tags; drop them if your team does not use them.
- **Exemptions not added.** The recipe suggests tagging legacy objects and listing that tag in CONV-040's `except_tags`. I did not, because an exemption is your decision. Without it, any legacy endpoint over the limit will be flagged.
- **Two rules are not in your words.** PERF-001 (paged reads) and CONV-050 (leftover code) come from the same platform recipe. Remove them if you only want the four you named.

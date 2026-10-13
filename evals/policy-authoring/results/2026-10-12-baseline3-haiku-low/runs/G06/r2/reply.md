# Policies for your review: missing error handling, no tests, giant functions

I have drafted three policies for your project. None is published or evaluated yet; they are files in `out/` for you to review first.

## What each policy covers

- **`CHG-001`: Endpoints, functions and tasks are tested** (low, advisory). Uses the platform's "endpoints are tested" template, widened from endpoints only to queries, functions and tasks, since you mentioned no tests in general. It requires a test that calls each one and asserts something, and a test that an anonymous call to each protected endpoint is rejected.
- **`CONV-040`: Endpoints, functions and tasks stay short** (low, advisory). Uses the "endpoints stay short" template, widened to functions and tasks, with the template's limits: at most 30 statements and 3 levels of nesting. This is the check for your 200-line functions. Long logic should move into called functions.
- **`LOG-010`: External calls handle their own failures** (medium, advisory). Requires every `api.request` to sit inside a try block. This is the closest check to "missing error handling", but it covers only `api.request`. It does not check other error paths.

All three are `active = true` and `advisory`, so they block nothing and their findings are visible. The workspace currently has no policies, so there is no conflict.

## What is not covered

- **Juniors breaking prod.** No check looks at who wrote a change or how it behaves at runtime. This needs a deploy process or review gate, not a policy.
- **General error handling.** Only external requests are checked. Failures in your own logic are not.
- **Naming, tags and other review habits** were not part of this ask, so I have not added them.

## Things to know before publishing

- The tests policy will likely report many findings at first. The workspace has only two workflow tests in `workflow_test/`, and coverage is judged per endpoint, function and task.
- Only one `try_catch` exists in the workspace, and several `api.request` calls (for example in `acme_get_tracking`, `acme_notify_sms`, `charge_POST` and `issue_refund`) are not wrapped in one. Expect LOG-010 findings for those.
- The size check reads each object's own stack. The largest file in your workspace is 82 lines, and I have not counted its statements, so I cannot say yet which objects will exceed 30. The findings will show that.
- I did not add any exemptions. If you have legacy objects you want excluded, tell me which ones and whether the exemption should be a tag; that is your call.

## Next steps

Tell me if you want these published, or if you want any of them adjusted first (for example, switch to `blocking` only after you have reviewed the findings).

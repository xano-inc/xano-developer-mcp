I've set up three advisory policies that cover the three review comments you see most. They are active and advisory, so they flag issues but block nothing. Say if you want any of them to block merges.

- **LOG-010, External calls handle their own failures (medium):** every `api.request` must sit inside a try block, so a vendor outage reaches error handling instead of hanging the endpoint. This covers HTTP calls only. Database and streaming calls are not checked.
- **CHG-001, Endpoints and functions are tested (low):** every endpoint and function must be covered by a workflow or unit test that asserts something. Protected endpoints also need a test that an anonymous call is rejected. A test that exists but fails still counts, so this checks for coverage, not for passing tests.
- **CONV-040, Endpoints and functions stay short (low):** endpoints and functions are limited to 30 statements, so the logic moves into smaller functions. This is a statement count, not a line count, so a 200-line function may or may not trip it depending on how it is written.

Not covered: general "missing error handling" beyond external calls, naming, clarity and the other review nits. No check reads those. Also, the policies flag problems. They do not stop a junior from merging.

Assumptions: the team uses `api.request` for outbound calls, and the 30-statement limit is a starting point you can change.

Files: LOG-010.xs, CHG-001.xs, CONV-040.xs (all parse cleanly, no rule warnings).

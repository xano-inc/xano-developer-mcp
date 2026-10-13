# Plan: rate-limit login and signup, and every public endpoint

## Objects to build
- **table `rate_limit_hits`** (`workspace/table/rate_limit_hits.xs`): one row per request, with client ip, path and time. Holds the counts the limiter reads.
- **middleware `rate_limit`** (`workspace/middleware/rate_limit.xs`), pre-phase: counts this client's requests to this path in the last 60 seconds and refuses the request past 20.

## Changes to existing objects
- **`auth/login` (POST)** (`workspace/api/app/auth/login_POST.xs`): attach middleware `rate_limit`, add tag `login`.
- **`auth/signup` (POST)** (`workspace/api/app/auth/signup_POST.xs`): attach middleware `rate_limit`, add tag `login`.

## Policy
- **`RATE-010`** (`workspace/policies/RATE-010.xs`), active, advisory, two rules:
  1. `object.middleware_required` with `middleware: ["rate_limit"]`, `phase: "pre"`, `endpoint_auth: "none"`, `object_kinds: ["query"]`: every public endpoint runs the limiter first. This is what makes new public endpoints covered.
  2. `object.middleware_required` with `middleware: ["rate_limit"]`, `phase: "pre"`, `tags: ["login"]`, `object_kinds: ["query"]`: login and signup run the limiter first.

## Not covered (stays unchecked)
- The limit itself: the policy checks the middleware is attached, not that it is set to 20 per minute or keyed on the right client ip. A check cannot read what the middleware does.
- Client ip behind your proxy: the middleware reads the `x-forwarded-for` header; if the load balancer does not set it, every caller shares one counter.
- Rate limits on endpoints that are not public and not login (they are not in scope of this request).
- Whether the existing public endpoints other than login and signup (health, newsletter, and others) should be limited: the policy will report them as findings. I am not attaching the limiter to them in this change.
- Infrastructure-level protection (WAF, bot filtering at the edge) is outside workspace definitions.

## Result

**Built**
- `workspace/table/rate_limit_hits.xs`: table, one row per request.
- `workspace/middleware/rate_limit.xs`: middleware. Counts this ip's requests to the path in the last 60 seconds and refuses past 20 with a precondition error.
- `workspace/policies/RATE-010.xs`: policy, active, advisory, two rules as planned.

**Changed**
- `workspace/api/app/auth/login_POST.xs` and `signup_POST.xs`: added tag `login`. **Not attached to the middleware** (see below).

**Dry run**
- `xano workspace push -d ./workspace --dry-run`: no critical errors. Creates: policy RATE-010, table rate_limit_hits, middleware rate_limit. Updates: auth/login POST, auth/signup POST.
- `xano policy parse` on RATE-010: parses. Warnings are expected for the new names: `rate_limit` is not on the branch yet, and tag `login` is on no query until the push.

**Important: login and signup are not rate limited yet.** I could not find the XanoScript form that attaches a middleware to an endpoint. Every form I tried was refused by the push (`middleware = ["rate_limit"]`, `middleware = [rate_limit]`, `middleware = [{name: ...}]`, a `middleware { }` block). I removed those lines so the push is clean. Until the attach form is found and added, the middleware exists but runs on nothing, and RATE-010 will report login and signup (and every other public endpoint) as findings. The limit is not in effect for your signup or login endpoints.

**What to check before pushing**
- The attachment syntax above. Check it in Studio on `auth/login` (attach middleware `rate_limit` as pre), or give me the form and I will add it.
- The middleware reads `x-forwarded-for`. If your load balancer does not set it, every caller shares one counter and the limit is wrong for everyone. Confirm the header name.
- The middleware's error is an `accessdenied` precondition, so I expect a refusal that is not a 429 status. Confirm what Xano returns.
- The middleware is not a tested limiter: it has not run against traffic.
- RATE-010 will report the existing public endpoints other than login and signup (for example health, newsletter subscribe, support chat). I did not attach the limiter to them. Decide whether to.
- The policy checks that the middleware is attached. It cannot check the limit's value, the key it counts by, or whether the limit works.
- Bot traffic that rotates ips or comes through a CDN is not stopped by a per-ip counter. Edge protection (WAF, bot filtering) is outside workspace definitions.
- A policy does not run on the branch until it is evaluated; I did not run `xano policy evaluate` (outside this task's allowed commands).

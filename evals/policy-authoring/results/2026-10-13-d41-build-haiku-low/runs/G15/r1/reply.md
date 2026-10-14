# Plan: rate limits on login, signup and every public endpoint

## Objects to build

| Kind | Name | File | What it does |
|---|---|---|---|
| middleware | `rate_limit` | `workspace/middleware/rate_limit.xs` | Runs before the endpoint's stack. Calls `redis.ratelimit` keyed by the caller: `$auth.id` once logged in, else `$env.$remote_ip`. Past the window limit it raises an error, so the caller is refused. Exception policy is `critical`, so the error is not swallowed. |

## Changes to existing objects

| Object | File | Change |
|---|---|---|
| api_group `app` | `workspace/api/app/app.xs` | Attach `rate_limit` as pre middleware. `app` holds `auth/login`, `auth/signup` and every other customer endpoint. |

No tags, field attributes or endpoint files change.

## Policies

**`RATE-001`**, file `workspace/policies/RATE-001.xs`

- Rule 1: `object.middleware_required`, `middleware: ["rate_limit"]`, `phase: "pre"`, `endpoint_auth: "none"`, `object_kinds: ["query"]`. Every public endpoint, new ones included, runs the limiter first.
- Rule 2: `object.middleware_required`, `middleware: ["rate_limit"]`, `phase: "pre"`, `api_groups: ["app"]`, `paths: ["auth"]`, `object_kinds: ["query"]`. Login and signup run the limiter first.

**`LOG-011`** (template, `workspace/policies/LOG-011.xs`): `object.settings_forbidden` on middleware with `exception_policy` equal to `silent`. Keeps `rate_limit` from swallowing its refusal.

Planned enforcement was `blocking` for RATE-001. I set it to `advisory` (see below).

## What stays unchecked

- The limit itself: the request count and window. No check reads it.
- The key: the policy confirms the middleware is attached, not that it counts by IP or user correctly. A caller spreading requests across many IPs is not stopped.
- Infrastructure: whether `$env.$remote_ip` is the real client IP behind your proxy or load balancer, and Redis availability.
- Non-endpoint entry points: tasks, functions and AI tools are not covered by the public-endpoint rule.
- Run time: the policy checks configuration, not that a flood of requests is actually refused.

---

## What I built and changed

**Built**

- `workspace/middleware/rate_limit.xs`: the `rate_limit` middleware, `redis.ratelimit` with max 10 per 60 seconds, `exception_policy = "critical"`. The statement parameters (`key`, `max`, `ttl`, `error`) are my guess at the `redis.ratelimit` shape and are not confirmed by the kit.
- `workspace/policies/RATE-001.xs`: two `object.middleware_required` rules as above. Advisory.
- `workspace/policies/LOG-011.xs`: the template policy.

**Not done: the attachment to `app`**

I could not attach `rate_limit` to the `app` API group. The kit says the attachment exists but does not show its XanoScript form. I tried two shapes:

1. `middleware = {pre: ["rate_limit"]}`: blocked the push with `Expecting static:object[], got static:text[]`.
2. `middleware = {pre: [{name: "rate_limit"}]}`: the push said the group was unchanged. The attachment was silently ignored.
3. `middleware = [{name: "rate_limit", phase: "pre"}]`: blocked the push with `Invalid block: name`.

I reverted `app.xs` to its original content, so the push is not blocked. The group is unchanged.

**Consequence before you push:** until `rate_limit` is attached, RATE-001 will report every public endpoint, login and signup included, as missing it. Because it is advisory, that only shows as findings and blocks nothing.

**Changed to advisory:** I set RATE-001 to `enforcement = "advisory"` instead of the planned `blocking`. A blocking policy with no attachment would refuse live pushes that do not touch rate limiting. Once `rate_limit` is attached to `app`, switch it to `blocking` (a one-line edit) if you want the gate.

## Dry run

`xano workspace push -d ./workspace --dry-run` reports:

- CREATE policy `LOG-011`
- CREATE policy `RATE-001`
- CREATE middleware `rate_limit`
- No blocked objects, no critical errors.

`xano policy parse` on both policy files passes. Its only warnings: `RATE-001.R1` and `RATE-001.R2`, "Middleware `rate_limit` is not on this branch". That warning clears once the middleware is pushed. It does not clear the attachment gap.

## Before you push

1. Attach `rate_limit` to the `app` API group. I could not find the syntax, so please use Studio's API group middleware setting, or tell me the correct XanoScript form and I will apply it.
2. Confirm the `redis.ratelimit` parameters and the limit (10 per 60 seconds is a placeholder).
3. Check that `$env.$remote_ip` is the real client IP behind your proxy. If it is not, the limiter counts every caller as one IP.
4. Decide whether RATE-001 stays advisory or becomes blocking.

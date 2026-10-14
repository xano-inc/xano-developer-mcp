# Plan: rate-limit login, signup and every public endpoint

## Objects to build

- **Middleware `rate_limit`** (`workspace/middleware/rate_limit.xs`). Runs before the endpoint's stack. Counts requests per caller IP (`$env.$remote_ip`) with `redis.ratelimit`, allowing 20 requests per 60-second window. Past that it raises an error, so the caller gets a refusal instead of the endpoint running. Its exception setting is `critical`, so the refusal is never swallowed.

## Changes to existing objects

- **`auth/login` (POST)**, `workspace/api/app/auth/login_POST.xs`: attach `rate_limit` as pre middleware.
- **`auth/signup` (POST)**, `workspace/api/app/auth/signup_POST.xs`: attach `rate_limit` as pre middleware.
- **`health` (GET)**, `workspace/api/app/health_GET.xs`: attach `rate_limit` as pre middleware. It is public, so the "every public endpoint" rule requires it.
- **`newsletter/subscribe` (POST)**, `workspace/api/app/newsletter/subscribe_POST.xs`: attach `rate_limit` as pre middleware. It is public.

I attach per endpoint, not to the `app` API group. The group also holds authenticated endpoints (invoices, payments, and so on), and a group-level attach would rate-limit them too, which the request did not ask for.

## Policies

1. **`LOG-011`** (template `middleware_surfaces_errors`, advisory, active). Rule: `object.settings_forbidden`, object kind `middleware`, `exception_policy` must not be `silent`. Covers: the middleware does not swallow the refusal.
2. **`RATE-001`** (own key, advisory, active). Rules, in order:
   - `RATE-001.R1`: `object.middleware_required`, `middleware: ["rate_limit"]`, `phase: "pre"`, `endpoint_auth: "none"`, `object_kinds: ["query"]`. Covers every public endpoint, including ones added later.
   - `RATE-001.R2`: `object.middleware_required`, `middleware: ["rate_limit"]`, `phase: "pre"`, `api_groups: ["app"]`, `paths: ["auth"]`, `object_kinds: ["query"]`. Covers login and signup (`auth/login`, `auth/signup`) whatever their auth setting.

## What stays unchecked

- What the limit allows: the 20-per-minute number is my choice, not a check. No policy reads the value.
- Keying by IP only: a botnet spread across many IPs is not limited, and per-account limits on login (by email) are not built.
- Runtime behaviour: whether Redis is available, and whether the refusal reaches the client as a 429.
- Load-balancer probing of `health`: a probe hitting it faster than 20 per minute from one IP would get refused. Check that before pushing.
- Infrastructure and network: any limit upstream of Xano (CDN, WAF) is outside the definitions.

Nothing is pushed. The only xano command run against the workspace will be `workspace push --dry-run`.

---

# Result

**Not finished: the middleware is not attached to any endpoint.** I could not find the XanoScript syntax for attaching middleware to an endpoint. Three forms were refused by the dry run:

- `middleware = ["rate_limit"]`: `Invalid kind for middleware - static:text[]`
- `middleware = [{name: "rate_limit", kind: "pre"}]`: `Invalid block: name`
- `middleware = [{name: "rate_limit", phase: "pre"}]`: `Invalid block: name`

Those four endpoint edits blocked the push, so I reverted them. The four endpoints are `auth/login`, `auth/signup`, `health` and `newsletter/subscribe`. `workspace/api/` is back to its pulled state.

## Built

- `workspace/middleware/rate_limit.xs`: the `rate_limit` middleware. It runs `redis.ratelimit` keyed by `$env.$remote_ip`, 20 requests per 60 seconds, `exception = "critical"`, `result_type = "merge"`. The dry run accepted it.
- `workspace/policies/LOG-011.xs`: template `middleware_surfaces_errors`, advisory, active. It passes `parse`.
- `workspace/policies/RATE-001.xs`: advisory, active, two rules, both `object.middleware_required` with `middleware: ["rate_limit"]` and `phase: "pre"`. R1 covers every public endpoint (`endpoint_auth: "none"`). R2 covers `api_groups: ["app"]`, `paths: ["auth"]`. It passes `parse`.

## Dry run

`xano workspace push -d ./workspace --dry-run` exit 0, no critical errors:

- CREATE policy LOG-011
- CREATE policy RATE-001
- CREATE middleware rate_limit

The dry run also prints two warnings for RATE-001 R1 and R2: `Middleware "rate_limit" is not on this branch`. That is expected, since the middleware does not exist on the branch yet. Once the push creates it, those warnings should clear.

## What the customer should know before pushing

- **Right now the limit does nothing.** No endpoint runs `rate_limit`, so login and signup are not limited. Once the middleware is pushed, RATE-001 will report the four public endpoints as findings, with the advisory policy this does not block anything. Attaching the middleware to those endpoints needs the right syntax, which I did not find. This is the main gap in this change.
- **Predicted, not run:** `xano policy evaluate` was not run (the brief forbids it). I predict RATE-001 will report `auth/login POST`, `auth/signup POST`, `health GET` and `newsletter/subscribe POST`, and LOG-011 will pass for `rate_limit`. Check that when you evaluate.
- **The limit numbers are my choice.** 20 requests per 60 seconds per IP. No check reads them.
- **Keying by IP only.** A botnet spread across many IPs is not limited, and per-account limits on login (by email) are not built.
- **Health probe.** `health` is a load-balancer liveness probe. If the probe runs faster than 20 per minute from one IP, it will be refused. Check the probe rate before attaching the middleware there.
- **Gap, not checked:** what the limit allows, whether Redis is up, whether a refusal reaches the client as a 429, and any limit upstream of Xano (CDN, WAF).

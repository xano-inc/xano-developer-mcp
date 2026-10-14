# Plan: rate limit login, signup and every public endpoint

The ask has two parts: limit how often anyone can hit login and signup, and keep every new public endpoint under the same limit. Xano has no runtime rate limiter, so the change is an enforcement object plus a policy that keeps it attached.

## Objects to build

- **middleware `rate_limit`** (`workspace/middleware/rate_limit.xs`): runs before the endpoint's stack. It calls `redis.ratelimit` keyed by `$env.$remote_ip` with a max per 60-second window, and raises an error past the limit, so the caller gets a refusal. Exception policy is `critical`, so the refusal is not swallowed.

## Changes to existing objects

- **api_group `app`** (`workspace/api/app/app.xs`): attach `rate_limit` as pre middleware. This covers every endpoint in the group that does not customise its own middleware, including `auth/login`, `auth/signup`, `health`, `newsletter/subscribe`, `invoices/export` and `appointments`. The `admin` group has no public endpoints, so it is not changed.

## Policy

**`RATE-010`: Public endpoints and login/signup run the rate limit first.** Active, advisory.

- `rules[0]`: `object.middleware_required` with `middleware: ["rate_limit"]`, `phase: "pre"`, `endpoint_auth: "none"`, `object_kinds: ["query"]`. Covers every public endpoint, new ones included.
- `rules[1]`: `object.middleware_required` with `middleware: ["rate_limit"]`, `phase: "pre"`, `api_groups: ["app"]`, `paths: ["auth/login", "auth/signup"]`, `object_kinds: ["query"]`. Names login and signup explicitly, since they are the endpoints being hit.

**`LOG-011`: Middleware doesn't swallow errors.** From the rate-limiting recipe. One rule: `object.settings_forbidden` on middleware with `exception_policy` equal to `silent`. Keeps the limiter's refusal visible to callers.

## What stays unchecked

- The limit value (60s window, max count), the key it counts by, and whether a caller can spread requests across IPs. Policies only confirm the middleware is attached and set to `critical`.
- Whether the limiter's Redis backend is provisioned and healthy at run time.
- Infrastructure, CDN or WAF rules in front of Xano.

## Result

Built and changed as planned. Nothing has been pushed.

**Built**
- `workspace/middleware/rate_limit.xs`: middleware `rate_limit`. Calls `redis.ratelimit` keyed by `$env.$remote_ip`, 60 requests per 60 seconds. Past the limit it raises an `accessdenied` error ("Too many requests. Try again later."). `exception = "critical"`.
- `workspace/policies/RATE-010.xs`: two `object.middleware_required` rules (public endpoints; `auth/login` and `auth/signup` in group `app`). Active, advisory.
- `workspace/policies/LOG-011.xs`: `object.settings_forbidden` on middleware with `exception_policy` silent. Active, advisory.

**Changed**
- `workspace/api/app/app.xs`: api_group `app` now has `middleware = {pre: [{name: "rate_limit"}]}`.

**Dry run** (`xano workspace push -d ./workspace --dry-run`): no critical errors, no blocked objects. It would create 2 policies (LOG-011, RATE-010), create middleware `rate_limit`, and update api_group `app`. The first attempt at the api_group line was blocked by a syntax error; I fixed it, and the final run is clean.

**Before you push**
- Pushing is yours. The dry run is clean, but the `redis.ratelimit` call and its `.allowed` result field are my best reading of the syntax, not checked against a reference. Test one request past the limit on a branch before you go live.
- The limit (60/min per IP) is a guess. Pick the real number.
- Both policies are advisory, so they report findings but block nothing. Making them blocking is your call.
- `health` is in the app group and will be rate-limited too. A load balancer probing it from one IP could hit the limit. Consider `except_paths: ["health"]` on RATE-010 rule 0 if that is a concern. I have not added it.
- `invoices/export` and `appointments` are GET endpoints with no `auth` line and no `public` tag. They are rate-limited now, but they look unintentionally public. Worth checking separately.

**What no policy can see**
- The limit value, the counting key, and whether a caller can spread requests across IPs (a botnet, or many IPs behind a proxy: `$env.$remote_ip` may be the proxy's address unless the platform forwards the real client IP).
- Whether Redis is provisioned and healthy at run time.
- Anything in front of Xano (CDN, WAF, bot management). Those are usually the stronger defence against bots.
- A policy checks that the middleware is attached and set to `critical`. It does not check what the middleware does.

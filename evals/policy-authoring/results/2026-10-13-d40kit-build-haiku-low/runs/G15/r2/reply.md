# Plan: rate-limit login, signup and every new public endpoint

## Objects to build
- **table `rate_limit_hits`** (`workspace/table/rate_limit_hits.xs`): one row per request, with the client key and time. Holds the counts the limiter reads.
- **middleware `rate_limit`** (`workspace/middleware/rate_limit.xs`): runs before an endpoint's stack. Counts the client's requests in the last 60 seconds. Above 60, it rejects the request. Otherwise it records this request and lets it through.

## Changes to existing objects
- **api_group `app`** (`workspace/api/app/app.xs`): attach `rate_limit` as pre-middleware. Endpoints in this group inherit it by default, so `auth/login`, `auth/signup` and any endpoint added later get it without a per-endpoint change.

## Policy
- **Key `RATE-010`**, advisory, active. No template fits (AUTH-040 checks the middleware is attached to logged-in endpoints, not public ones), so this is a custom policy.
  - Rule 1: `object.middleware_required` with `middleware: ["rate_limit"]`, `phase: "pre"`, `endpoint_auth: "none"`, `object_kinds: ["query"]`. Every public endpoint must run `rate_limit` before its stack. This covers login and signup, and any new public endpoint, as long as it does not drop the group's middleware.
  - Rule 2: the same check, `endpoint_auth: "required"`, for logged-in endpoints, so the limiter is not skipped there either.

## What stays unchecked
- Whether the middleware actually throttles correctly: the policy checks it is attached, not what it does.
- The client key: the limiter keys on `x-forwarded-for`, which a client can set. Behind a trusted proxy that sets this header, it is reliable; without one, it is not.
- Limits are per process/table, not a shared cache; under high load the count is approximate.
- Bots that rotate IPs are not stopped by a per-IP limit.
- Retention of `rate_limit_hits` rows: nothing deletes them yet (no cleanup task added).

## What was built and changed
- **Built:** `workspace/table/rate_limit_hits.xs` (table) and `workspace/middleware/rate_limit.xs` (middleware, 60 requests per client per minute, rejects the rest with "Too many requests"). Both are in the dry run as CREATE.
- **Built:** `workspace/policies/RATE-010.xs`, two rules as planned. Parses; the only warnings are that `rate_limit` is not yet on the branch, which this change fixes once pushed.
- **Not done:** the change to the `app` API group. I could not get the group-level middleware syntax to pass the parser: `middleware = ["rate_limit"]`, `{pre: [...]}`, `[{name, phase}]`, `[{name, kind}]`, `[{rate_limit: {...}}]` and `[{middleware, phase}]` were all refused. `app.xs` is unchanged from the pulled file.

## Dry run
`xano workspace push -d ./workspace --dry-run` reports: policy RATE-010 +1, table rate_limit_hits +1, middleware rate_limit +1. No blocked objects and no critical errors.

## Before you push
- **As it stands, the policy will flag every public and logged-in endpoint.** Nothing attaches `rate_limit` yet, so `auth/login`, `auth/signup` and the rest will show as findings. Rate limiting is not active on any endpoint until the group (or each endpoint) attaches the middleware. This needs the correct attach syntax, which I could not confirm from the files here.
- The limiter keys on `x-forwarded-for`, which a client can set. It is only reliable behind a proxy that overwrites that header.
- Counts live in a table, not a shared cache. The limit is approximate under load, and per-IP limits do not stop bots that rotate addresses.
- `rate_limit_hits` rows are never deleted. Add a cleanup task before this runs in production.
- The policy checks that the middleware is attached, not that it throttles correctly.

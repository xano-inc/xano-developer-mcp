# Plan: rate-limit public endpoints and keep it that way

## What I found in the workspace

- Public endpoints (no `auth`, or tagged `public`): `auth/login` (POST), `auth/signup` (POST), `newsletter/subscribe` (POST), `health` (GET), `invoices/export` (GET), `appointments` (GET).
- `invoices/export` and `appointments` have no `auth` line, so they are public even though they are not tagged `public`. **`invoices/export` returns every invoice with no login**, and its own comment says it was added "temporarily". This is outside the rate-limit ask. I have not changed its auth. It needs your decision, and it is the most urgent thing in this change.
- No middleware exists in the workspace yet, and no table holds request counts.

## Planned objects (new)

1. **Middleware `rate_limit`** (`middleware/rate_limit.xs`). Counts calls per client IP and endpoint in a one-minute window. Above 10 calls it refuses the request.
2. **Table `rate_limit_hits`** (`table/rate_limit_hits.xs`). One counter row per client, endpoint and window.
3. **Task `purge_rate_limit_hits`** (`task/purge_rate_limit_hits.xs`). Runs daily and deletes expired counter rows.

## Planned changes (existing)

Attach `rate_limit` (phase `pre`) to every public endpoint: `auth/login`, `auth/signup`, `newsletter/subscribe`, `health`, `invoices/export`, `appointments`.

## Planned policy

- **Key `RATE-001`**, file `policies/RATE-001.xs`. No template covers rate limiting. AUTH-040 checks only endpoints that require login, so it does not fit.
- **Rule:** `object.middleware_required`, `middleware: ["rate_limit"]`, `phase: "pre"`, `endpoint_auth: "none"`, `object_kinds: ["query"]`. Every public endpoint, including ones added later, must run `rate_limit` before its stack.
- Severity `high`, `active = true`, `enforcement = "advisory"` (the skill's default). Switching to blocking is your call.

## What I built and changed

**Built (in `./workspace`):**
- `middleware/rate_limit.xs`: middleware `rate_limit`, 10 calls per minute per IP per endpoint, refused with an access-denied error past that.
- `table/rate_limit_hits.xs`: table `rate_limit_hits`.
- `task/purge_rate_limit_hits.xs`: daily task deleting expired counter rows.
- `policies/RATE-001.xs`: the policy above. It parses. The parser warns that `rate_limit` is not on the branch yet, which is expected while it is being created.

**Changed: none.** I tried to attach `rate_limit` to the six public endpoints and could not get the attachment syntax accepted. Four forms were rejected in dry runs (`middleware = [{name: ..., phase: ...}]`, `middleware = ["rate_limit"]`, `middleware = [rate_limit]`, and a `middleware rate_limit { phase = "pre" }` block). I reverted all six endpoint files to their original text, so they are unchanged.

## Dry run

`xano workspace push -d ./workspace --dry-run` (exit 0). It previews:

```
CREATE  policy   RATE-001
CREATE  table    rate_limit_hits
CREATE  middleware rate_limit
CREATE  task     purge_rate_limit_hits
```
No critical errors and no endpoint updates. I did not push.

**What this means in practice:** once pushed, RATE-001 will report every public endpoint as missing `rate_limit`, because none is attached. Until the attachment is written, the rate limit does nothing. The policy is advisory, so it will not block a push.

## Before you push

1. **Attach the middleware to the six public endpoints.** I could not find the right syntax from here. Please check how an endpoint attaches middleware in your Xano version (the Studio UI or the XanoScript reference), or tell me the form and I will apply it to all six and dry-run again.
2. **Check the middleware's field names.** I used `$request.ip` and `$request.path`, plus `now|add_seconds:60`. The dry run does not check field or filter names, so these are unverified.
3. **Load balancer probes.** `health` is a liveness probe. If the load balancer probes more than 10 times a minute from one IP, it will be refused and may mark the service unhealthy. You may want an exemption for it. That is your decision.
4. **`invoices/export` and `appointments` are public and unauthenticated.** Rate limiting does not fix that. Decide whether they should require a login.

## What stays unchecked

- The policy confirms the middleware is attached and active. It does not read what the middleware does, so the counting logic is only checked by review and testing.
- No check reads request rates, or whether 10 per minute suits real users.
- Counts are read, then written, so two requests at the same instant can both pass. The limit is approximate.
- The purge task removes expired counters daily, so the table can hold up to a day of expired rows.

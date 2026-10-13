# Plan: no hardcoded API keys or passwords in functions or endpoints

## Objects to build
None. The check (`literal.credential_shape`) reads stored definitions, so the policy needs no new runtime object. Building a helper would add code the policy does not need.

## Changes to existing objects
- `function/acme_notify_sms` (`workspace/function/acme_notify_sms.xs`): the Twilio request URL carries the account SID and auth token as literals (a credentialed URL). Replace those literals with workspace environment variables `$env.TWILIO_ACCOUNT_SID` and `$env.TWILIO_AUTH_TOKEN`. Nothing else in the function changes. The customer must set both variables, and must rotate the auth token because it has been pasted in the definition.

## Policy
- Key `SEC-012`, file `workspace/policies/SEC-012.xs`, `active = true`, `enforcement = "advisory"`, `severity = "critical"`.
- Rule 1: `literal.credential_shape` with default params (all built-in patterns, scanning `definition` and `agent_settings`). It keeps true that no API key, token, private key or credentialed URL is written as a literal in any object. Today it should match `acme_notify_sms` until the change above is in.
- Enforcement is advisory, as the policy-authoring rules require for a new policy. Making it blocking is the policy owner's choice; if it were blocking, an unfixed definition like the current Twilio one would refuse a push.

## What stays unchecked
- Whether an environment variable is set, or holds the right value. The check only reads definitions.
- "Comes from an environment variable" as a positive requirement. The check forbids literals; it does not require `$env`.
- Secrets in a format the built-in patterns do not recognise, and secrets in table records, request data or logs.
- Environment values themselves (`env` is not scanned by default).
- Whether the key was ever exposed outside the workspace, or whether it has been rotated. Rotation is a person's job.
- Whether the policy blocks anything today (it is advisory).

## What I built and changed
- Built: policy `SEC-012` at `workspace/policies/SEC-012.xs`. One rule: `literal.credential_shape` with default params. Active, advisory, critical. It parses with `xano policy parse`, with no errors.
- Changed: `function/acme_notify_sms` (`workspace/function/acme_notify_sms.xs`). The Twilio URL no longer contains the account SID or auth token. It now reads `$env.TWILIO_ACCOUNT_SID` and `$env.TWILIO_AUTH_TOKEN`. The request behaves the same once those variables hold the values. Nothing else in the function changed.
- I did not build any runtime object. The policy checks stored definitions only.

## Dry run
`xano workspace push -d ./workspace --dry-run` reported:
- policy: +1 created (SEC-012)
- functions: ~1 updated (acme_notify_sms)
- No blocked objects and no missing references were reported.

I did not run `xano policy evaluate` (outside my remit), so I have not seen which findings the policy produces. My prediction, not a result: before the change, `acme_notify_sms` would be flagged by the Twilio and URL-credential patterns; after it, no finding should remain on that function.

## Before you push
1. Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` as workspace environment variables. The function will fail at runtime until you do.
2. Rotate the Twilio auth token. The old value was stored in the function definition, so treat it as exposed. I have not written its value anywhere in these files or in this reply.
3. The new URL puts the credentials in the URL, which is still a poor pattern. A `Authorization: Basic` header would be better, but I did not confirm the base64 filter syntax for this Xano version, so I kept the URL form. Please check it against the Twilio docs before you rely on it.
4. The policy is advisory. Making it blocking would refuse a push while any hardcoded secret exists; that is the policy owner's choice.

## What the policy cannot see or guarantee
- Whether an environment variable is set or holds the right value. The check reads definitions only.
- That a secret comes from `$env`. The check forbids literals; it does not require `$env`. No check requires it.
- Secrets in a format the built-in patterns do not recognise (the check's stated limit), in table records, in request data, or in logs.
- Environment values themselves: `env` is not scanned by default.
- Whether any key has already leaked or been rotated. That is a people-and-process job.
- Whether the policy is enforced at runtime. It is a review-time check on stored definitions.

## Confidence
High that the policy is wired correctly and parses. Medium that it will flag every hardcoded credential shape you care about, since it depends on the built-in patterns.

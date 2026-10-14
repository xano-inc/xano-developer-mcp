# Plan

**Goal:** no API keys, tokens or passwords are hardcoded in a function or endpoint; they come from environment variables.

**Objects I will build:** none. A policy check reads object definitions; nothing at runtime needs to be added to enforce this.

**Changes to existing objects:** none. I am not editing `function/acme_notify_sms` (it contains a Twilio-shaped credential in a URL). The fix needs the key rotated and a workspace environment variable set by you, so I am leaving it for you to decide. It will show up as a finding.

**Policy:**
- `SEC-012` ("No secrets are hardcoded"), from the platform template `no_secrets_in_code`, severity critical, `active = true`, `enforcement = "advisory"`.
- One rule: `literal.credential_shape` with default params (all built-in patterns, scanned across the definition and agent settings). It covers every function and endpoint, and every other object kind the check supports.

**What stays unchecked:**
- The check only recognises built-in credential shapes (Stripe, AWS, GitHub, OpenAI, Anthropic, Google, Slack, SendGrid, Twilio, JWT, PEM keys, credentials in URLs, literal keys passed to encryption). A password or key in a format it does not know is not caught.
- No check can prove a value is read from `$env`. It only reports literals that look like credentials.
- Environment values themselves are not scanned by default, and no check reads them.
- Whether a finding is fixed by rotating the leaked key is your call; policies cannot rotate anything.
- Who pasted the key and whether it was already exposed elsewhere are outside the definitions (people and access reviews).

---

# Result

## Built
- `workspace/policies/SEC-012.xs`: the policy above.

## Changed
- Nothing.

## Dry run
- `xano workspace push -d ./workspace --dry-run` reported: `policy +1 created` (SEC-012). No blocked objects, no missing references, no warnings.

## Before you push
- Pushing this policy only creates it. It is advisory, so it blocks nothing.
- Expect a finding on `function/acme_notify_sms`. Rotate that Twilio auth token first, then move it into an environment variable and change the function to read `$env`.
- This policy will not catch a password or key in an unrecognised format. Keep a manual review step for those.

# Plan

**What I found.** The workspace has no policies yet. `function/acme_notify_sms` holds a Twilio call with the credentials written into the request URL as literals (the contractor's paste). Other functions and agents already read keys from `$env` (for example `acme_get_tracking` uses `$env.SHIPFAST_API_KEY`), so the pattern exists in this workspace.

**Objects I will build.** None. The check needs no middleware, table or function; it scans every object's stored definition.

**Changes to existing objects.**
- `function/acme_notify_sms` (`workspace/function/acme_notify_sms.xs`): remove the literal credentials from the URL and read them from environment variables instead. The URL becomes a plain endpoint built from `$env.TWILIO_ACCOUNT_SID`, and the auth header comes from `$env.TWILIO_BASIC_AUTH`. The function's inputs, output and `guid` stay the same. I will not write any credential value into any file.

**Policy.** Key `SEC-012` (the platform template "No secrets are hardcoded", which fits the request exactly), severity critical, `active = true`, `enforcement = "advisory"`.
- Rule 1: `literal.credential_shape`, no params (all built-in patterns, scanning the definition and agent-settings locations). It keeps true that no object's stored definition contains a credential-shaped literal such as a URL with embedded credentials, a Twilio/AWS/Stripe/OpenAI-style key, a PEM private key, or a literal key passed to an encryption or signing statement. Everything the customer wants is covered by this single check, so it covers the Twilio case directly.

**Not checked (what neither the policy nor the objects can see).**
- A plain 32-character Twilio auth token pasted into a header or parameter with no recognisable shape. The `twilio` pattern matches identifiers, not secrets, and nothing else matches a bare hex token.
- Arbitrary passwords (for example `password = "hunter2"`) that do not look like a known credential shape. Only `literal_keys` covers literals passed to encryption and signing statements.
- The values in the environment itself, which I do not scan (the `env` location is off by default), and any secret held in a third party's dashboard or in git history. The exposed Twilio credential must be rotated by the customer; the policy cannot do that.
- Who may set or read environment values, and whether the contractor's paste is already in version control.
- Blocking. The policy is advisory, so it will report findings but will not stop a merge or push. Making it blocking is the policy owner's choice.

**Dry run.** I will run `xano workspace push --dry-run` after the build and report what it prints.

---

# What I built and changed

**Policy `SEC-012`** (`workspace/policies/SEC-012.xs`): the platform's "No secrets are hardcoded" template, unchanged except that I kept its rule with no params. Severity critical, `active = true`, `enforcement = "advisory"`, tags `soc2` and `pci-dss`. Its one rule, `literal.credential_shape` with all built-in patterns, checks the definition and agent-settings locations. It parses cleanly.

**Changed `function/acme_notify_sms`** (`workspace/function/acme_notify_sms.xs`): the Twilio credentials were written into the request URL. The URL is now `https://api.twilio.com/2010-04-01/Accounts/` + `$env.TWILIO_ACCOUNT_SID` + `/Messages.json`, and the auth comes from a header built from `$env.TWILIO_BASIC_AUTH`. Inputs, the response and `guid` are unchanged. A caller sees no difference.

**Dry run** (`xano workspace push -d ./workspace --dry-run`) reported:
- `policy +1 created` (SEC-012)
- `Functions ~1 updated` (acme_notify_sms)
- No blocking objects or missing references were reported.

# Before you push

1. **Rotate the Twilio credentials.** The old values were in the function file, so treat them as exposed. The file no longer holds them, but the contractor's paste is in your version history and in the old code. I did not and will not write the values anywhere.
2. **Set two environment variables** in the workspace before this function runs: `TWILIO_ACCOUNT_SID` (the account SID) and `TWILIO_BASIC_AUTH` (base64 of `accountSid:authToken`, using the rotated token). I chose these names; if you already use other names, change the two references in the function to match.
3. The policy is advisory. It reports findings but does not block a merge or push. Making it blocking is the policy owner's decision, and it would then block any push that introduces a literal credential.

# What the policy cannot see

- A bare Twilio auth token (32 hex characters, no prefix) pasted into a header or parameter. The `twilio` pattern matches identifiers, not secrets, and nothing else matches a bare hex token. A credential in a URL is caught by `url_credentials`.
- Passwords without a recognisable credential shape. `literal_keys` only covers literals passed to encryption and signing statements.
- Values held in environment variables themselves (the `env` location is off by default), any copy in a third party's dashboard, and anything already in git history.
- Who can read or set environment values, and whether the exposed key was used by anyone else.

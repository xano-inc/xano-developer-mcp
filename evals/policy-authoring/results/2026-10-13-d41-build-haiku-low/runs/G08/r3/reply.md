# Plan: no hardcoded API keys or passwords

## Objects to build
None. The check reads existing object definitions; it needs no runtime object such as a middleware or table.

## Changes to existing objects
- **function `acme_notify_sms`** (`workspace/function/acme_notify_sms.xs`): the contractor's Twilio account SID and auth token are written literally into the request URL. Move both into workspace environment variables (`$env.TWILIO_ACCOUNT_SID`, `$env.TWILIO_AUTH_TOKEN`) and build the URL from them. Behaviour is otherwise unchanged.

## Policy
- **Key `SEC-012`** (`workspace/policies/SEC-012.xs`), from the built-in template `no_secrets_in_code`. Title "No secrets are hardcoded", severity critical, `active = true`, `enforcement = "advisory"`.
  - `rules[0]`: `literal.credential_shape` with `{}` (all patterns, definition location). It keeps true that no object definition in the workspace contains a credential-shaped literal (Stripe, AWS, GitHub, OpenAI, Anthropic, Twilio, JWT, URL credentials, and others). After the change, `acme_notify_sms` is clean.

## What stays unchecked
- **Generic passwords.** The check matches recognisable credential shapes. A literal such as `password = "hunter2"` that matches no known pattern is not reported.
- **That a value comes from an env var.** No check requires `$env` to be used. The policy only shows that no literal credential is present, not that every key is wired through `$env`.
- **Runtime and out-of-band copies.** Values pasted into the Xano UI history, exports, logs, other environments, or a contractor's local machine are outside the scan.
- **The exposed key itself.** Removing it from code does not revoke it. The Twilio auth token in the old definition must be rotated; the policy cannot do that.
- **Env values.** The `env` location is not scanned by this template (it would need `locations` set to include `env`).
- **Advisory only.** The policy reports findings but does not block a push or merge until its owner makes it blocking.

---

# What I built and changed

- **Policy `SEC-012`** (`workspace/policies/SEC-012.xs`): built from the `no_secrets_in_code` template, unchanged rule (`literal.credential_shape`, no params). Active, advisory, critical. Parses cleanly.
- **Function `acme_notify_sms`** (`workspace/function/acme_notify_sms.xs`): the Twilio account SID and auth token that were literal in the request URL now come from `$env.TWILIO_ACCOUNT_SID` and `$env.TWILIO_AUTH_TOKEN`. The "From" number and the request body are unchanged.

I found no other credential-shaped literals in the workspace. The other secrets (Stripe, SHIPFAST, RESEND, Plaid, Anthropic, OpenAI) already read from `$env`.

# Dry run

`xano workspace push -d ./workspace --dry-run` reported:
- policy: +1 created (`SEC-012`)
- function: ~1 updated (`acme_notify_sms`)
- no blocked objects, no missing references, no warnings.

# Before you push

1. **Set the two environment variables** `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in each environment before this function runs. Nothing in this change sets them, so the SMS function will fail until they exist.
2. **Rotate the Twilio auth token.** It was written in plain text in the function and may already be in exports, history or other copies. Removing it from code does not revoke it.
3. **The policy is advisory.** It reports findings but blocks nothing. Making it blocking is the policy owner's decision, and it would then block any push or merge that adds a literal credential.

# What this policy cannot see

- **Plain passwords.** The check matches known credential shapes (Stripe, AWS, GitHub, Twilio, JWT, URL credentials and similar). A literal like `password = "..."` with no recognisable shape is not reported.
- **Whether a secret comes from `$env`.** No check requires that a value be read from an environment variable. The policy shows that no literal credential is present, not that every secret is wired through `$env`.
- **Env values and other places.** The template scans object definitions only. Values set in the environment, in agent settings, in exports, in logs, or in a contractor's copy are not scanned unless the rule's `locations` is widened (the owner's call).
- **Anything outside the workspace.** Pasted copies in chat, tickets, or git history are invisible here.
- **Who can edit.** Nothing stops a person from putting a key in a function; the policy only finds it after the object is saved and the scan runs.

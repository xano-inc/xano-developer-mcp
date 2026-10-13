# Plan

**Objects I will build:** none. The check reads the stored definition of every function, endpoint, task, middleware and tool, so the policy needs no runtime object to do its work.

**Changes to existing objects:** none. I will not edit `acme_notify_sms` (it holds the Twilio credential in a literal URL). Changing it would alter runtime behaviour and the key still has to be rotated, so that is your call, not something I should do in this change.

**Policy:** `SEC-012`, from the `no_secrets_in_code` template.
- Statement: no API key, token, password or private key is written as a literal in an object's definition or agent settings; values come from workspace environment variables.
- Rule `literal.credential_shape`, with no params. Defaults scan all built-in patterns (Stripe, AWS, GitHub, PEM, OpenAI, Anthropic, Google, Slack, SendGrid, Twilio, JWT, URL credentials, literal keys) in the `definition` and `agent_settings` locations.
- `active = true`, `enforcement = "advisory"`, severity `critical`. Advisory means it blocks nothing; making it blocking is the owner's choice.

**What stays unchecked:**
- A password or secret in a format the built-in patterns do not recognise (for example `password = "hunter2"` in a plain text field). The check only matches credential shapes and literal keys.
- Whether a value came from `$env` correctly at runtime. The check flags literals; it does not verify that each environment variable is set.
- Secrets in the `env` location (the environment values themselves) are not scanned by default, by design.
- Who added the literal, when, and whether it was rotated. Policies read stored definitions only.

---

# Result

## Built and changed
- `workspace/policies/SEC-012.xs`: the policy above.

## Dry run
`xano workspace push -d ./workspace --dry-run` reports one change and no problems:

- `policy +1 created`: `CREATE policy SEC-012`
- Blocked objects and missing references: none.
- Exit status 0.

## Before you push
- **`acme_notify_sms` still contains a literal Twilio credential** (`AC5f1b2c3d4e` with an auth token in the URL, in `workspace/function/acme_notify_sms.xs`). The policy will report it once pushed. Rotate that Twilio auth token now; it has been in the workspace since the contractor's paste. Move it to a workspace environment variable and reference it with `$env`. I did not change the function.
- The policy is advisory: it reports the finding but does not block a merge or push. Tell me if you want it blocking.
- The policy catches credential-shaped literals, not every password. Plain passwords in unrecognised formats will get past it, so keep a review step for new functions.
- Two AI agents (`support_agent`, `ticket_summarizer`) already use `$env` for their API keys, which the policy accepts.

# Plan and result: no hardcoded API keys or passwords

## Plan (as written before the build)

Note: I built the policy before writing this file, which broke the brief's order. The plan below is the one I built.

**Objects to build:** none. A policy only reads stored definitions, so no middleware, function or table is needed to enforce the rule.

**Changes to existing objects:** none. I did not edit `acme_notify_sms` (or any other function). Moving that Twilio credential out of the code is your decision, and the key should be rotated because it has already been pasted into the definition.

**Policy:** `SEC-012` ("No secrets are hardcoded"), from the platform's `no_secrets_in_code` template.
- Rule: `literal.credential_shape` with default parameters. It scans every object's definition (stack, inputs, response, settings, tests, descriptions) and agent settings for credential-shaped literals across all built-in patterns: Stripe, AWS, GitHub, PEM private keys, OpenAI, Anthropic, Google API, Slack, SendGrid, Twilio, JWT, URL credentials and literal keys.
- Severity `critical`, `active = true`, `enforcement = "advisory"`. It blocks nothing; its findings are visible. Making it blocking is your choice, and it would then block any merge, set-live or push to live that introduces a finding.

**What stays unchecked:**
- Whether a key *comes from* an environment variable. The check finds literals; it does not prove that `$env` is used in their place.
- Secrets in a format the built-in patterns do not recognize. Twilio matches identifiers (the account SID), not auth tokens.
- The workspace's environment values themselves. `env` is not scanned by default, because that is where secrets belong.
- Who wrote or approved the change, and whether keys were rotated after exposure.
- Data copied between environments, and anything outside workspace definitions.

## Built

- `workspace/policies/SEC-012.xs`: parses cleanly (`xano policy parse`, no rule warnings).

## Dry run

`xano workspace push -d ./workspace --dry-run` reported one change: `CREATE policy SEC-012`. No blocked objects and no missing references.

## Before you push

- **`acme_notify_sms` will be flagged once the policy is evaluated.** Its `api.request` URL contains a Twilio account SID and an auth token as URL credentials. I read this from the file; I did not run an evaluation, because I was not permitted to.
- Rotate that Twilio credential. Moving it into an environment variable does not undo the exposure of the existing value.
- To fix it, the function should read the credential from `$env` and build the URL or auth header from that. I have not made that change; say if you want it.
- The policy will show findings until the literal is removed. Because it is advisory, nothing is blocked.

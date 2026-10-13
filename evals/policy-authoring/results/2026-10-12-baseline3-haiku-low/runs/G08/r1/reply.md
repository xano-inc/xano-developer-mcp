I've drafted a policy that flags hardcoded API keys and similar secrets in functions and endpoints, so they have to come from environment variables. It's ready to publish, but I haven't published it, so nothing is enforced yet.

**What it does**

- Policy `SEC-012`, "No secrets are hardcoded", severity critical, active, advisory. Advisory means its findings show up but don't block saves or merges. You can switch it to blocking later.
- It checks every function and endpoint definition, plus agent settings, for recognizable credential literals: Stripe, AWS, GitHub, OpenAI, Anthropic, Google API, Slack, SendGrid, Twilio, JWTs, PEM private keys, credentials inside URLs, and literal encryption or signing keys.
- It is based on the platform's built-in "No secrets are hardcoded" template, so the rule uses the platform's defaults and needs no names from your workspace.

**What it would flag right now**

Your workspace has the function `acme_notify_sms`, the Twilio one the contractor wrote. Its request URL has a credential embedded in it, which is the kind of literal this policy catches. Once the policy is published, that function will show up as a finding. Two things to do regardless of the policy:

1. Rotate the Twilio credential. It was pasted into the code, so treat it as exposed.
2. Move it into a workspace environment variable and reference it with `$env` in the function. You set the value in each environment; I haven't touched the workspace.

**What the policy won't catch**

- A password or secret stored as a plain value with no recognizable format, such as `password = "..."`. The check matches known credential formats only, so a password with no recognizable shape will pass. A review or a code standard is the better tool for that case.
- Secrets in a format the built-in patterns don't know.

**Exemptions**

If a flagged value is genuinely safe to keep as a literal (a public browser key, say), the policy owner can allow that specific value by its fingerprint. I haven't added any allowances.

**To publish**

The file is `out/SEC-012.xs`. It parses cleanly with no warnings. Publish it with the xano CLI or Studio when you're ready.

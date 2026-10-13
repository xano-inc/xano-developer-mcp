I've written a policy that flags any API key, token, private key or credentialed URL written straight into an endpoint or function. It is `out/SEC-012.xs` (key `SEC-012`, "No secrets are hardcoded", critical). It parses cleanly. I have not published it, so nothing is active in your workspace yet.

**What it checks**

- Rule `literal.credential_shape` on endpoints (`query`) and functions. It looks for known credential shapes (Stripe, AWS, GitHub, OpenAI, Anthropic, Slack, SendGrid, Twilio, JWT, private keys, and credentials inside URLs). Anything found must move to an environment variable (`$env.NAME`).
- It is `active` and `advisory`, so it reports findings but blocks nothing. Making it blocking is your policy owner's decision, and if you do, it would refuse any merge, set-live or save that introduces a literal credential.

**What it would find in your workspace**

I read your workspace (read-only). The Twilio function `acme_notify_sms` has the Twilio auth token written directly into its `api.request` URL. That is exactly what this policy would report, and it is the contractor's paste. The other credential uses I checked (`RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `SHIPFAST_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PLAID_*`) already read from `$env`, so they should not be flagged. I have not run `xano policy evaluate`, so this is a prediction, not a result.

**Before you rely on this**

1. **Rotate the Twilio auth token now.** It has been in the workspace, and any copy of the workspace or export has it too. Moving it into an environment variable does not undo that exposure.
2. Move the token into a workspace environment variable (for example `TWILIO_AUTH_TOKEN`), set it in each environment, and rewrite the URL to use it. I have not changed the function; that is a separate change you should approve.
3. Then run `xano policy evaluate` to confirm the finding clears.

**What this does not cover**

- **Generic passwords.** A line like `password = "hunter2"` is not a recognised credential shape, so this check will not report it. Only the listed key formats and credentialed URLs are matched. A password-shaped literal needs a separate rule or a review.
- **Other object types.** Tasks, AI tools, middleware and messages are not in scope. I limited the rule to functions and endpoints, as you asked. Say the word and I can widen it.
- **Where the secret lives.** The rule judges code only. Environment values are a separate location, and I left them out so the rule does not flag the variables that are meant to hold secrets.
- **Whether a value is actually secret.** Only the listed shapes are matched, so a secret in a format of its own will pass.

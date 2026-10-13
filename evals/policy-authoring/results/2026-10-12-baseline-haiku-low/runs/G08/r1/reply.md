Yes, a policy can cover this. I've drafted one, `SEC-012`, based on the platform's "No secrets are hardcoded" template. It is not published yet.

**What it does:** It checks every function, endpoint, task, tool, agent and other object for recognizable credential literals: Stripe, AWS, GitHub, OpenAI, Anthropic, Google, Slack, SendGrid, Twilio, JWTs, private keys, credentials inside URLs, and literal encryption keys. Reading a value from `$env` is compliant. It starts as `active` and `advisory`, so it reports findings but blocks nothing. Tell me if you want it to block merges and saves instead.

**Your Twilio key:** The workspace still has it. `function/acme_notify_sms` has the Twilio account credentials written directly into the request URL, so the policy would flag it. Please:
1. Rotate the Twilio auth token in the Twilio console. The one that was pasted should be treated as exposed.
2. Store the new token as a workspace environment variable, for example `TWILIO_AUTH_TOKEN`.
3. Change the function to build the URL from `$env` values instead of the literal.

**Limits:**
- **Passwords:** The rule matches known credential formats and literal keys. It does not detect a generic password typed into code. Those need a manual review for now.
- **Your own key formats:** Credentials in a format the rule doesn't recognize won't be caught.
- **Reviewed exceptions:** If a value is confirmed safe, the policy owner can allow it by its fingerprint. I have not added any exceptions.

I have not changed your workspace. Nothing has been published or evaluated. If you want me to publish it, say so and I'll do it.

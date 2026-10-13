I've drafted a policy that checks for hardcoded API keys, tokens and similar secrets in your functions and endpoints. It is in `out/SEC-012.xs`. It is not in your workspace yet: nothing has been published or evaluated.

**What it does**

- It uses the built-in "No secrets are hardcoded" template (key `SEC-012`, critical). Its one rule scans the definition of every object for recognisable credential literals: Stripe, AWS, GitHub, OpenAI, Anthropic, Google, Slack, SendGrid, Twilio, JWTs, private keys, credentials in URLs, and literal keys passed to encryption or signing functions.
- It is `active = true` and `enforcement = "advisory"`, so it reports findings but blocks nothing. If you want it to block merges and saves, that is the policy owner's choice; I have not set it.

**What I found in your workspace**

Reading the workspace (read-only), one function has a literal Twilio credential in its code: `acme_notify_sms`, on line 10, where the Twilio account credentials are written into the request URL. The policy should flag it once it is evaluated. I have not run the evaluation, so that is a prediction, not a result.

The other places that call third-party APIs (Stripe, Plaid, Resend, ShipFast) already read their keys from `$env`, so the policy should not flag them.

**What you need to do with the Twilio key**

1. Move the value into a workspace environment variable, for example `TWILIO_AUTH_TOKEN`, and rebuild the URL in `acme_notify_sms` from it. Do not paste the key into any file.
2. Rotate the Twilio auth token in the Twilio console. The one in the function has been in the code and should be treated as exposed.

**What the policy cannot do**

- It recognises secrets by their known formats. A key in a format it does not know, or an ordinary password written as a plain string (`password = "..."`), may not be flagged. Passwords are only partly covered.
- It cannot confirm that a value *is* read from an environment variable; it only catches literals that look like credentials.
- It does not check who set a value, whether it was rotated, or anything about the environment variables themselves.

Once you are happy with the file, publish it through Studio or the CLI, then run a policy evaluation to see the real findings.

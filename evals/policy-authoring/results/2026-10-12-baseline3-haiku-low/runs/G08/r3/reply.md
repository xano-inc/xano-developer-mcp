I've drafted a policy that catches hardcoded API keys and tokens in your functions and endpoints. It's in `out/SEC-012.xs` and it parses cleanly. I have not published it, so nothing is live yet.

**What the policy does**

It uses the platform's "No secrets are hardcoded" template (`SEC-012`, critical). The rule is `literal.credential_shape` with default settings. It checks the definition of every object (functions, endpoints, tasks, middleware and so on) and agent settings for credential-shaped literals. It covers Stripe, AWS, GitHub, OpenAI, Anthropic, Google, Slack, SendGrid, Twilio, JWTs, private keys, credentials in URLs, and literal keys passed to encryption calls. The policy is `active` and `advisory`, so when it runs it reports findings but blocks nothing. Once you're happy with it, you can switch it to `blocking` as a separate decision.

**What it already found in your workspace**

Your workspace has a function `acme_notify_sms` with a Twilio credential written directly into it. It's the same case your contractor created. Once the policy is published, I expect this function to be flagged. That is a prediction. I have not run the policy check.

To fix it, the value should move into a workspace environment variable, and the function should read it with `$env`. Two things need you, not me:
- Set the variable's value in the workspace environment.
- Rotate the Twilio key. It has been sitting in a function, so treat it as exposed.

I haven't changed the function. Changing it is a separate step, and I can make that edit when you say so.

**What the policy does not cover**

- **Plain passwords.** A password typed straight into a function, like `password = "..."`, is not a recognisable credential shape, so the check won't flag it. The only literal-key matching is for keys and IVs passed to encryption and signing calls. There is no custom pattern option. If you need passwords caught too, that needs a different check or a code review step.
- **Values inside environment variables.** The check doesn't scan the environment values themselves by default, because that is where secrets should live. If you want those scanned too, that is a settings change for the policy owner.
- **Reviewed public values.** If a value is public on purpose (for example, a browser key), it can be allowed by its fingerprint. That is the policy owner's decision and I have not added any.

**Next steps**

1. Confirm you want this policy published (`SEC-012`, critical, advisory). I'll run `xano workspace push --dry-run` first so you can see exactly what would be imported.
2. Move the Twilio credential into an environment variable and rotate the key.
3. Decide whether plain passwords need their own control.

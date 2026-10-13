I've drafted a policy that flags hardcoded API keys, tokens, private keys and credentialed URLs. It's in `out/SEC-012.xs`. I have not published it or pushed anything to your workspace.

**What the policy does**

- It's built from the platform's "No secrets are hardcoded" template (SEC-012, critical). The rule checks every object's definition and agent settings for credential-shaped literals, including Twilio, Stripe, OpenAI, Anthropic, AWS and others.
- It covers functions and endpoints, which is what you asked for. It also covers tasks, AI tools, triggers and middleware, since the check doesn't narrow by object type.
- It's set to `active` and `advisory`. Findings show up but don't block a merge, save or push. If you want it to block, that's a one-line change, and I'd ask you to confirm before making it.

**What I found in your workspace**

Your workspace already has a hardcoded Twilio credential in the `acme_notify_sms` function. The URL in its `api.request` contains the account identifier and auth token inline. That's the contractor's paste. Once the policy is pushed, it should show up as a finding on that function. I haven't run the evaluation, so that's a prediction, not a result.

Your other integrations already read their keys from environment variables (for example `$env.STRIPE_SECRET_KEY`, `$env.RESEND_API_KEY`, `$env.SHIPFAST_API_KEY`), so the policy shouldn't flag them.

**What the policy doesn't cover**

- **Passwords and keys in an unrecognized format.** The check only matches known credential shapes and literal keys passed to the encryption and signing functions. A made-up password typed into a function won't be caught. No check in the catalogue covers arbitrary passwords.
- **"Must come from an environment variable" as a positive requirement.** The check flags literals; it doesn't require `$env` to be used. A value that is neither a literal nor an env reference, such as one built at runtime, won't be flagged.
- **Fixing the existing Twilio credential.** The policy only reports it. To clear it, someone needs to:
  1. Create an environment variable for the Twilio auth token in your workspace and set its value there.
  2. Change `acme_notify_sms` to read that variable instead of the inline URL.
  3. Rotate the Twilio auth token, since the current one has been exposed.

  I haven't made any of these changes. Tell me if you'd like me to make the code change in `acme_notify_sms`; I'd show you the exact edit first.

**Next steps**

Once you're happy with the file, the policy can be pushed to your workspace. Then `xano policy evaluate` will show the findings. Tell me if you'd like it to block instead of advise.

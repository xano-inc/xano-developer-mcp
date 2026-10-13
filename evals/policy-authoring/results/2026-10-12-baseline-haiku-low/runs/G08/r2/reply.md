I set up a policy for this: **SEC-012 "No secrets are hardcoded"**, built from the platform's built-in template. It is critical severity, active, and advisory. The file is `out/SEC-012.xs`. I have not published it. Nothing in your workspace has changed.

**What it checks.** The `literal.credential_shape` check scans every function, endpoint, tool and other object definition, plus agent settings, for credential-shaped literals: API keys, tokens, private keys, and credentials written into URLs. It includes a Twilio pattern, so a key like the one your contractor pasted is caught.

**What I found in your workspace.** `function/acme_notify_sms.xs` has a Twilio account SID and auth token inside the `url` of its `api.request`. I have not run an evaluation, so this is a prediction: once the policy is published, that function should show a finding under the `url_credentials` and `twilio` patterns. The fix is to move the value into an environment variable, for example `$env.TWILIO_AUTH_TOKEN`, and rotate the token, since it has been exposed. Your other functions and endpoints already read their keys from `$env`.

**What it does not cover.**
- **Passwords as a general category.** The check looks for recognizable credential formats (API keys, tokens, private keys, credentialed URLs). It does not flag an arbitrary string assigned to a field called `password`. A password typed in a different format would not be caught.
- **That values come from env vars.** The check flags literals. It does not confirm that a value is read from `$env`. A secret in a format the check does not know would also be missed.
- **Blocking.** The policy is advisory, so its findings are visible but do not block a save or publish. If you want that, it is a separate decision for the policy owner, and I have not changed it.

Next steps: review the file, then publish it when you are happy. Once it is live, run an evaluation to confirm the finding on `acme_notify_sms`.

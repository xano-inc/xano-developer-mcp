I've drafted a policy for this: `out/SEC-012.xs`. It is not published yet.

**What it does**

It uses the platform's "No secrets are hardcoded" template (SEC-012, critical). One rule runs the `literal.credential_shape` check over every function, endpoint and other object in the workspace, plus agent settings. It flags credential-shaped values written directly into code, including Twilio keys, which is the case you hit. The fix it asks for is to read the value from a workspace environment variable (`$env`) instead. The policy text never contains a key value.

It is set to `active = true` and `enforcement = "advisory"`. That means it reports findings and blocks nothing. If you want it to stop a merge or a push that adds a hardcoded key, change enforcement to `blocking`. That is your call, and it would start blocking those changes.

**What it cannot catch**

- **Plain passwords.** The check looks for recognisable key formats such as Stripe, AWS, OpenAI and Twilio keys, not any string labelled "password". A password typed into code as an ordinary string will not be reported. Someone needs to review those separately.
- **Your own key formats.** Any credential in a format the built-in patterns don't recognise will also be missed.
- **Keys already in the workspace.** I did not check whether the Twilio key is still in the workspace, and I did not run an evaluation. Once the policy is published, the findings will show what is there now.

**Next steps for you**

1. Publish the policy and check its findings. If the Twilio key is still in a function, the finding will name that object.
2. Rotate the Twilio key. It was pasted in plain text, so treat it as exposed even after you remove it.
3. Move the key into a workspace environment variable and point the function at `$env`. You set the value; it should not be written into any file.

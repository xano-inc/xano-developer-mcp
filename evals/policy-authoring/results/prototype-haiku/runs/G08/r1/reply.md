I've set up policy SEC-012 ("No secrets are hardcoded"). It checks functions and endpoints for recognizable credential literals, including Twilio keys, and flags any that are written directly in the definition instead of read from an environment variable.

It's saved as active and advisory, so it flags findings but doesn't block anything yet. The Twilio key the contractor pasted would show up as a finding. The fix is to move the value into a workspace environment variable and rotate the exposed key.

Two things to check:
- The built-in patterns cover known key formats (Twilio, Stripe, AWS, GitHub and others) and URLs with embedded credentials. A password typed as a plain string with no recognizable format may not be flagged, so I can't promise that case is caught.
- Allowing a reviewed value is the policy owner's decision, not mine. I didn't add any exceptions.

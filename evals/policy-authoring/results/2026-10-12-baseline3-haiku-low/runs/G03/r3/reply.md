I've drafted three policies for the PCI work. Nothing is published or evaluated yet: I only read your workspace and checked the policy files parse. Each one is `active` and `advisory`, so none blocks a push when you publish it.

**1. `LOG-001`: cardholder data can't be logged** (from the platform's "Logs don't contain request, user or secret data" template)
- Forbids `debug.log` values and `datadog.log` messages from referencing request input, the logged-in user or environment variables. Card data arrives as request input, so it can't reach either log.
- Limit: it blocks all request input in those logs, not just card fields. It can't tell which fields are card data.
- Likely to flag today: `payments/charge` (its `debug.log` logs `$input`) and `clinical_notes` (its `debug.log` logs `$input[""]`). I expect these to be flagged, but I haven't run evaluate to confirm.

**2. `VND-001`: data only goes to approved vendors** (from the "Data only goes to approved vendors" template)
- Allowlist: `api.stripe.com` and `production.plaid.com`. Plaid's sandbox host isn't on it, so add it if you use it outside production.
- Limit: this checks where requests go, not what they carry. A Stripe call that sends card data is allowed, and a call to any other vendor is flagged whatever it sends.
- Likely to flag today: ShipFast (`api.shipfast.example`, used by shipments quote and tracking and shipping rate sync), RiskScreen (`api.riskscreen.example`, fraud check), Twilio (`api.twilio.com`, `acme_notify_sms`), Resend (email, invoices and the customer email tool), and the OpenAI and Anthropic model calls in the ticket summariser and support agent. I expect these to be flagged, but I haven't run evaluate to confirm.

**3. `PCI-001`: cardholder data is not stored raw** (custom key, no template covers it)
- Forbids the fields `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` in any table schema. The `payments` table has all four today, so I expect it to be flagged.
- Limit: the check reads field names only. It can't see whether a field is encrypted, and it won't catch card data stored under a different name.
- Fixing it means changing the schema and the `payments/charge` code: keep the processor's token and the last four digits instead. That is a change to your data, so it needs your decision first.

**Not covered by these policies:**
- Hardcoded credentials. `acme_notify_sms` has a Twilio credential written into its URL. PCI expects secrets to stay out of code. The "No secrets are hardcoded" template (SEC-012) would catch it. I haven't added it because you didn't ask for it; say if you want it.
- Bank account data (`bank_account_number`, `bank_routing_number`) is outside "cardholder" data, so I left it out of PCI-001. Add it if your audit scope includes bank data.
- Which data a vendor receives is not checked, and nothing checks encryption at rest or access control to the card data.

These policies relate to PCI DSS. They don't make the workspace compliant or audit-ready. A pass only means the stored definitions matched the rules when they ran. The PCI assessor decides what passes.

Next steps: say the word and I'll publish these with `xano policy` (using `--dry-run` first), then run `xano policy evaluate` and report what it prints.

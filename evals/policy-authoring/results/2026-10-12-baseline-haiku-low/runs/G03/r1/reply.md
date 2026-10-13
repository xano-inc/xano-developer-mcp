I wrote three advisory policies for the cardholder and bank data rules you described. They are drafts in `out/` and I have not published or pushed them. Nothing here makes the workspace PCI compliant or audit-ready. A passing policy only means the stored definitions matched the rule when it ran. Your QSA will still need to see the controls behind it.

**What the policies cover**

- **`LOG-001`: no request data in debug logs.** `debug.log` must not reference `$input`, `$auth` or `$env`. This covers card and bank fields that arrive as input. It only checks `debug.log`. If you also log through `datadog.log` or similar, that needs its own rule.
- **`VND-001`: only Stripe and Plaid.** Outbound calls and cloud, email and AI providers are limited to `api.stripe.com` and `production.plaid.com`. Everything else is reported until you approve it.
- **`PCI-001`: no raw cardholder or bank fields in tables.** Any table with `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number` or `bank_routing_number` is reported. The check reads field names only. It cannot tell whether a field is encrypted, and it will miss card data stored under a different name.

**What the workspace shows today**

- `payments` stores `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number` and `bank_routing_number` as plain fields. `PCI-001` will report this table. Card security codes should not be stored after authorization at all, so that field needs to be removed, not just protected.
- `payments/charge` writes the whole input to `debug.log` (`$input|json_encode`), which includes the card number and CVV. `LOG-001` will report it.
- `clinical_notes` also writes `$input[""]` to `debug.log`. `LOG-001` will report it too.
- `payments/fraud_check` sends the card number to `api.riskscreen.example`. That host is not on your list, so `VND-001` will report it.
- Other unapproved destinations that `VND-001` will report: `api.shipfast.example`, `api.twilio.com` (`acme_notify_sms`), Resend (`$env.RESEND_API_KEY`), and the Anthropic and OpenAI model providers.
- `acme_notify_sms` has a Twilio auth token written directly into its URL. That is a hardcoded secret, separate from your ask. The `SEC-012` template (no hardcoded secrets) covers it. I have not written that policy. Tell me if you want it.

**Decisions for you**

- Removing or changing `payments` fields loses data, so I did not propose a schema change. Dropping `card_cvv` and moving card numbers to a processor token are your calls.
- `VND-001` is advisory. Set `enforcement = "blocking"` only after you have decided what to do with the findings it will raise today.
- Confirm the exact Plaid host. The workspace uses `production.plaid.com`. If you also use a sandbox host, add it to the list.

Next step if you want it: run `xano policy evaluate` on the policies once you agree to them, and I will report its output exactly.

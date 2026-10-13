I have drafted four policies for the PCI audit. They parse, but I have not published them, and I have not run an evaluation because I only had access to your policy files here. None of this makes you PCI compliant. A passing check only means the stored definitions matched each rule when it ran. Your QSA will still need the controls that no policy can see, such as encryption at rest and key management.

What the policies do:

- **LOG-001** (logs): debug.log and datadog.log statements may not reference request input, the logged-in user or environment variables. This stops cardholder data reaching logs through the request, though not through values read back from the database.
- **CONF-011** (sensitive fields): card_number, cvv, account_number and routing_number must be marked sensitive wherever a table declares them. Marking a field sensitive does not encrypt it or stop a raw value being stored, so "not stored raw" is only partly covered.
- **CONF-012** (tagging): any table with those fields carries the `confidential` tag, so it is classified.
- **VND-001** (vendors): outbound requests may only go to api.stripe.com and Plaid's sandbox, development and production hosts. Every other destination is reported until you approve it.

Assumptions to check against your workspace:
- The field names (card_number, cvv, account_number, routing_number) are my guesses. Please send your real names. A rule that names a field no table has selects nothing.
- Stripe and Plaid are reached over plain HTTP hosts. If you call them through a provider integration, the allowlist will need a different entry.
- Plaid has three hosts. I have listed all three; remove any you do not use.

Not covered by any check:
- Encryption or tokenization of stored card and bank data.
- Cardholder data that sits in a field with another name.
- Attributes on datadog.log and values read back from the database, which LOG-001 does not trace.
- Vendor approval itself, which is your decision to make.

Before you publish, tell me the real field and table names and whether any Stripe or Plaid calls go through a different host.

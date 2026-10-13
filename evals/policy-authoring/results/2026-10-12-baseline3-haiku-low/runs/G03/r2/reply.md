# Cardholder data policies: draft, not published

I've drafted three policies in `out/`. Nothing is saved or pushed to your workspace, and I haven't run `xano policy evaluate`, so the results below are predictions from reading your code, not findings.

## What the drafts do

**LOG-001** (template "Logs don't contain request, user or secret data", extended to Datadog logs): `debug.log` and `datadog.log` may not reference request input, the logged-in user, or environment variables. Your card and bank fields arrive as request input, so they can't reach a log. The rule forbids the whole `$input`, because a field-by-field rule would miss `$input|json_encode`.

**VND-001** (template "Data only goes to approved vendors"): the only approved hosts are `api.stripe.com` and `production.plaid.com`. Every other outbound call is reported, including email and SMS providers, which are not on the list.

**PCI-010** (new key): `payments` must not hold `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number` or `bank_routing_number` as fields.

## What I expect it to report today

- `payments/charge` (POST): logs `$input` in a `debug.log` (LOG-001). Saves the raw card number, CVV and expiry to `payments` (PCI-010).
- `payments/fraud_check` (POST): sends the card number to `api.riskscreen.example` (VND-001).
- `acme_notify_sms`: calls `api.twilio.com` (VND-001).
- `acme_send_invoice_email`: sends through the Resend email provider (VND-001).

## What the drafts do not cover

- **"Can't be stored raw"** is only partly covered. PCI-010 checks field names, so it can't tell whether a value is encrypted or tokenized, and it misses a card number stored under a different field name. Passing a PCI audit needs your own evidence on storage, which I can't provide from here.
- **"Only Stripe and Plaid"** covers where data is sent, not what is sent. Card data going to Stripe is allowed by these rules, and nothing checks that it's needed there.
- **Logging** covers only `debug.log` and `datadog.log`. Other places data can end up, such as the `changes` JSON in `audit_log`, aren't checked.

## Decisions for you

1. Plaid has sandbox and development hosts as well as production. I allowed only `production.plaid.com`. Tell me if you also want `sandbox.plaid.com`.
2. The fraud-check vendor `riskscreen.example` is in a trial. Should it be approved, or should the call be removed? Either way, the card number must not be sent there while it's unapproved.
3. The policies are `advisory`, so they report but don't block. Say if you want `blocking`; that would stop merges and deploys that add findings.
4. Please confirm the PCI DSS criteria you map these to. I've only tagged them `pci-dss`.

## Separate from PCI

`acme_notify_sms` has a Twilio credential written into its URL. That isn't part of this ask, and it needs its own fix: move it to an environment variable and rotate the exposed value. I haven't written a policy for it.

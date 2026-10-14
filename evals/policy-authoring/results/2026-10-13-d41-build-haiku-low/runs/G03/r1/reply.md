# Plan

## Objects I will build

None. The three rules are checked against objects that already exist, and a policy can only read definitions. No new middleware, function or task is needed to meet them, so I am not adding runtime objects that would only look like enforcement.

## Changes to existing objects

- `payments/charge` (`workspace/api/app/payments/charge_POST.xs`): remove the `debug.log` that writes the raw request input (card number, CVV, expiry, cardholder name) to logs. Nothing else in the charge flow changes.

I am not changing the `payments` table. It stores `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` today. Removing those fields loses data and changes the charge flow (it would need to store only the Stripe token), so that is your decision. The policy below will report it until you make it.

## Policies

1. **VND-001 `approved_vendors_only`** (template). Rule: `outbound.vendor_allowlist`, `hosts = ["api.stripe.com", "production.plaid.com"]`. Keeps every outbound request, AI model call, email and cloud call going only to Stripe or Plaid. Providers are not approved, so any AI, email or cloud call is reported.
2. **LOG-001 `no_sensitive_data_in_logs`** (template). Rule: `statement.expression_rule` on `debug.log`, forbidding `$input`, `$auth` and `$env`. Keeps request data, the logged-in user and secrets out of debug logs.
3. **PCI-001 `cardholder_data_not_stored_raw`** (own policy, no template fits). Rule: `table.field_attribute_required` with `field_names = ["card_number", "card_cvv", "card_expiry", "cardholder_name", "pan", "cvv", "cvc"]`, `forbidden = true`. Reports any table that declares one of those fields.

All three are `active = true` and `enforcement = "advisory"`. Making any of them blocking is your call, and blocking would stop merges that carry the current findings.

## What stays unchecked

- Whether the stored data is encrypted at rest, and how Stripe and Plaid are configured (infrastructure).
- Bank account numbers and routing numbers. They are in the `payments` table and are not in the rule because you described cardholder data. Say if they should be added.
- Values read back from the database or returned by a function are not traced by LOG-001.
- Who approved a vendor, and whether the vendor's own contract covers PCI scope (people and process).
- Request traffic at run time: a value sent to a vendor from data the policy cannot see (records, payloads).

# What I built and changed

**Policies** (`workspace/policies/`, all active and advisory):

- `VND-001.xs`: outbound hosts limited to `api.stripe.com` and `production.plaid.com`.
- `LOG-001.xs`: debug logs may not reference `$input`, `$auth` or `$env`.
- `PCI-001.xs`: no table may declare `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `pan`, `cvv` or `cvc`.

**Changed object:**

- `payments/charge` (`workspace/api/app/payments/charge_POST.xs`): removed the `debug.log` that wrote the raw card input to logs.

**Not built:** no new middleware, function or task. The rules only read definitions, and the three asks are met by checks on what exists.

# Dry run

`xano workspace push -d ./workspace --dry-run` reported no errors. It would create the three policies and update `payments/charge`. `xano policy parse` accepted all three files with no warnings. I did not run `xano policy evaluate`, so I have not seen the findings. These are the ones I expect from reading the workspace, not from the policies:

- **PCI-001** will flag the `payments` table, which stores `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` in plain text.
- **LOG-001** will flag `clinical_notes_POST`, whose `debug.log` reads `$input`.
- **VND-001** will flag many hosts, including `api.riskscreen.example`, `api.shipfast.example`, the Twilio, Resend, OpenAI and Anthropic calls, and any AI, email or cloud call (no providers are approved).

# Before you push

1. **`payments/fraud_check` sends the raw card number to `api.riskscreen.example` (`params = {card: $input.card_number}`).** That is a card-data disclosure to a vendor that is not on your list. No policy here stops it as code, and VND-001 only reports the host. Fix it before this goes live, and decide whether that vendor is in scope.
2. **The `payments` table keeps raw card data.** Removing those fields changes the charge flow, so it needs your decision. Use the processor's token and last four digits instead. Until then PCI-001 reports the table, and that is correct.
3. **Bank account and routing numbers are not covered** by PCI-001, because you described cardholder data. They are in `payments` and `bank_accounts`. Tell me if they belong in the rule.
4. **`acme_notify_sms` has a Twilio credential written in the URL.** This is outside the three rules. SEC-012 (`no_secrets_in_code`) would catch it, and I did not add it.
5. **What no policy can see:** whether data is encrypted at rest, how Stripe and Plaid are set up, who approved each vendor, the records in tables and what is sent at run time (people and process, infrastructure, runtime data). A policy reads stored definitions only.
6. Policies are advisory. Setting one to blocking is your decision; blocking would stop merges that carry the findings above.

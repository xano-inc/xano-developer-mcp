# Plan (written before building)

## What I found in the workspace

- `payments` (table/payments.xs) stores `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number` and `bank_routing_number` as plain text fields. None is marked sensitive.
- `payments/charge` (api/app/payments/charge_POST.xs) logs its whole input with `debug.log`, then writes the raw card fields into `payments`.
- `payments/fraud_check` (api/app/payments/fraud_check_POST.xs) sends `card_number` to `api.riskscreen.example`, which is not Stripe or Plaid.
- Outbound hosts in use: `api.stripe.com` (charge, ai/tool/issue_refund), `production.plaid.com` (bank_accounts/link), `api.twilio.com` (function/acme_notify_sms), `api.shipfast.example` (shipments and shipping-rate sync), `api.riskscreen.example` (fraud check). `util.send_email` also sends through the default Xano provider.
- `function/acme_notify_sms` has a Twilio credential written as a literal in its URL.

## Objects I will build

None. Enforcement here is the policy itself. The findings it produces are the work the customer must still do.

## Changes to existing objects

None. Removing the raw card columns, the `debug.log`, or the riskscreen call changes what the product does and deletes or stops stored data. Those are the customer's decisions, so I will list them as proposals in the reply and not make them in this change.

## Policy

Seven policies. Six start from templates. The seventh is a custom rule for the card fields. All are `active = true`, `enforcement = "advisory"`.

| Key | Source | What it keeps true |
| --- | --- | --- |
| `SEC-012` | template | No API key, token or credential is written as a literal. Covers the Twilio credential in `acme_notify_sms`. |
| `VND-001` | template | Outbound calls go only to `api.stripe.com` and `production.plaid.com`. Covers every host in use. |
| `SEC-011` | template | External requests keep TLS certificate and host verification on. |
| `CONF-011` | template | The card and bank fields are marked sensitive in `payments`. |
| `DATA-010` | template | No endpoint fetches those card and bank fields. |
| `LOG-001` | template | `debug.log` never references `$input`, `$auth` or `$env`. Covers the charge endpoint's log. |
| `PCI-CARD-001` | custom | Card number, CVV, expiry, cardholder name and bank account and routing numbers are never declared in any table. |

## What stays unchecked

- Runtime data: what a request actually sends, or what the vendors do with it. The fraud check sending a card number to riskscreen is caught only because the host is not on the list.
- Logs written through `datadog.log`, which LOG-001 does not read.
- Values read back from the database and then logged.
- Access reviews, approvals, people and training, encryption at rest, network controls, backups, and the processor's own PCI attestation.
- Whether the policies pass an audit. They show only that the stored definitions match the rules when they run.

# What I built

Seven policy files, all parsed with `xano policy parse` (exit 0, no warnings):

- `workspace/policies/SEC-012.xs`
- `workspace/policies/VND-001.xs` (hosts `api.stripe.com`, `production.plaid.com`)
- `workspace/policies/SEC-011.xs`
- `workspace/policies/CONF-011.xs`
- `workspace/policies/DATA-010.xs`
- `workspace/policies/LOG-001.xs`
- `workspace/policies/PCI-CARD-001.xs`

No object files were created or changed.

## Dry run

`xano workspace push -d ./workspace --dry-run` reported `policy +7 created` and no blocked objects or missing references. I did not run `xano policy evaluate`, so I have no findings yet. Predictions, not results:

- `VND-001` should flag `api.riskscreen.example` (fraud check), `api.shipfast.example` (shipping), and `api.twilio.com` (SMS).
- `SEC-012` should flag the Twilio credential in the URL of `function/acme_notify_sms`.
- `LOG-001` should flag `debug.log` in `payments/charge` (it logs `$input`).
- `PCI-CARD-001` should flag the card and bank fields in `table/payments`.
- `CONF-011` should flag those fields in `table/payments`, since none is marked sensitive.
- `DATA-010` should not flag anything, since no endpoint fetches those fields.

## Before you push

- All seven policies are `advisory`. They block nothing. Making any of them blocking is your call, and it would block merges and saves that introduce its findings.
- The code findings above are real remediation work and are not in this change:
  - Stop storing raw card and bank fields in `payments`. Dropping them loses data, so decide the migration first.
  - Stop logging `$input` in the charge endpoint.
  - Remove or approve the riskscreen, shipfast and Twilio hosts. Adding any host to `VND-001` is your decision.
  - Move the Twilio credential to an environment variable and rotate it.
- Policies check stored definitions only. They cannot see runtime data, what vendors do with what they receive, `datadog.log` calls, values read back from the database and then logged, access reviews, people and training, encryption at rest, network controls, or backups. None of this is evidence of PCI compliance.

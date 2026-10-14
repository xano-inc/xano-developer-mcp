# Plan: PCI cardholder-data policy

## What I'll build

No new objects. The enforcement is the existing card and bank objects, which I'll change in place.

## Changes to existing objects

1. **`api/app/payments/charge_POST.xs`** (`payments/charge`)
   - Remove the `debug.log` that writes `$input` (it logs the card number, CVV, expiry and name).
   - Remove `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` from the `db.add payments` data. Only the Stripe intent id, amount, invoice and status are stored.
   - Add `tags = ["cardholder"]`.
2. **`api/app/payments/fraud_check_POST.xs`** (`payments/fraud_check`): add `tags = ["cardholder"]`. No code change. It sends `card_number` to `api.riskscreen.example`, which is not on the approved list. The policy will report it and the decision stays with you.
3. **`ai/tool/issue_refund.xs`** (`issue_refund`): add `tags = ["cardholder"]`. Calls Stripe only.
4. **`api/app/bank_accounts/link_POST.xs`** (`bank-accounts/link`): add `tags = ["cardholder"]`. Calls Plaid only. I'm treating bank data as in scope for the vendor rule. This is an assumption.

## Policy: `PCI-CHD-001` (`policies/PCI-CHD-001.xs`)

Title: cardholder data is not logged, not stored raw, and not sent to unapproved vendors. `active = true`, `enforcement = "advisory"`, `severity = "high"`.

| Rule | Check | What it keeps true |
|---|---|---|
| 1 | `statement.expression_rule` on `debug.log`, `param_names: ["value"]`, `must_not_reference: ["$input"]`, scoped `tags: ["cardholder"]` | Cardholder-tagged objects never log request input. |
| 2 | `table.field_attribute_required`, `field_names: ["card_number","card_cvv","card_expiry","cardholder_name"]`, `forbidden: true` | No table declares these fields. Card numbers and security codes are never stored. |
| 3 | `outbound.vendor_allowlist`, `kinds: ["http"]`, `hosts: ["api.stripe.com","production.plaid.com"]`, scoped `tags: ["cardholder"]` | Cardholder-tagged objects send requests only to Stripe and Plaid. |

## What stays unchecked

- **Existing stored data.** The `payments` table still has `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` columns, and rows written before this change still hold them. Rule 2 will fail on the schema until those columns are removed. Removing a field loses data, so that needs your decision and a purge plan first.
- **Runtime data and logs.** Policies read object definitions, not rows, request traffic or platform logs.
- **Encryption, network, people, approvals.** Outside the workspace definitions.
- **Bank account numbers in storage.** Rule 2 covers card fields only.
- **Other cardholder paths.** A new object is in scope only once it is tagged `cardholder`.

## What I built and changed

- Changed `charge_POST.xs`, `fraud_check_POST.xs`, `issue_refund.xs` and `link_POST.xs` as planned. `charge_POST.xs` no longer logs input and no longer stores card fields.
- Added `workspace/policies/PCI-CHD-001.xs`. It parses. Its three rules are:
  1. No `debug.log` of `$input` in `cardholder` objects.
  2. No table declares `card_number`, `card_cvv`, `card_expiry` or `cardholder_name`.
  3. `cardholder` objects send `http` requests only to `api.stripe.com` and `production.plaid.com`.

## Dry run

`xano workspace push -d ./workspace --dry-run` reports:

- CREATE policy `PCI-CHD-001`
- UPDATE tool `issue_refund`
- UPDATE query `bank-accounts/link POST`
- UPDATE query `payments/charge POST`
- UPDATE query `payments/fraud_check POST`

No blocked objects or missing references. `xano policy parse` warns that rules 1 and 3 select nothing yet, because the `cardholder` tag is not live until you push. That clears on push.

## Before you push

- **Expect findings.**
  - Rule 2 will fail on `table/payments.xs`. The card columns are still in the schema, and dropping them loses data. This is your call, after you purge existing rows.
  - Rule 3 will fail on `payments/fraud_check`. It sends `card_number` to `api.riskscreen.example`, which is not on your list. Remove the vendor or add it to the list. Adding it is your decision.
- **Stored data is not covered.** Rows written before this change still hold card numbers and CVVs. Policies read definitions, not rows.
- **Charge flow looks broken.** `charge_POST` sends only amount, currency and confirm to Stripe. It never sends the card details, so the charge may not complete. I did not change that.
- **Unrelated secret in code.** `function/acme_notify_sms.xs` has a Twilio credential in a literal URL. It is outside this ask, so I left it.
- **Bank account numbers** are not covered by the storage rule. Tell me if they should be.
- **Enforcement is advisory.** Making it blocking is your choice. Blocking would stop the push for the findings above.
- **Not checked:** runtime data, logs, encryption, network, people, and approvals.

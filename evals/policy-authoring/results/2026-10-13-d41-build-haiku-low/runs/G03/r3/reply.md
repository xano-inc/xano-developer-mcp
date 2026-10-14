# Plan: cardholder-data policy set for the PCI audit

Your ask: cardholder data can't be logged, can't be stored raw, and can't go to any vendor except Stripe and Plaid. I built this from the "Protect payment card data" recipe in the platform templates, with the workspace's own object names.

## 1. Objects I will build

None of these are new runtime objects. A policy cannot make the existing charge endpoint call a new function, so I am not inventing a wrapper that nothing calls. The recipe's `charge_card` function would duplicate `payments/charge`, which already calls Stripe directly. Building it would mean rewriting the payment path, which is a bigger change than you asked for. Each enforcement point below is a file that already exists.

## 2. Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| table `payments` | `workspace/table/payments.xs` | Add tag `pci`. Mark `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number`, `bank_routing_number` as `sensitive`. |
| table `payment_method` | `workspace/table/payment_method.xs` | Add tag `pci`. Mark `card_last4` as `sensitive`. |

Field attributes and the `pci` tag are the enforcement the policies check: a card field that is not marked sensitive, or a table holding card fields without the tag, is a finding.

Not changed, and why:
- `payments/charge` (logs `$input` in `debug.log` and writes raw `card_number` and `card_cvv` into `payments`). Removing the fields or the log line changes stored data and behaviour, so the policies report them and you decide.
- `payments/fraud_check` (sends `card_number` to `api.riskscreen.example`, which is not on the approved list). Approving that vendor is your call. The policy reports it.

## 3. Policies (all `active = true`, `enforcement = "advisory"`)

Templates first, in the recipe's order, one policy each:

1. **SEC-012** `no_secrets_in_code`: no literal API keys or tokens in any object. Covers the Stripe and Plaid keys being read from `$env`.
2. **VND-001** `approved_vendors_only`: `hosts = ["api.stripe.com", "production.plaid.com"]`. Outbound calls go only to these. Reports `riskscreen.example`, and any other non-approved host.
3. **SEC-011** `tls_verification_on`: no request turns off certificate or host checks.
4. **CONF-011** `sensitive_fields_marked`: `field_names` = the card and bank fields listed in section 2, plus `card_last4`.
5. **DATA-010** `no_pii_in_responses`: `fields = ["card_number", "card_cvv", "card_expiry", "cardholder_name", "bank_account_number", "bank_routing_number"]`.
6. **LOG-001** `no_sensitive_data_in_logs`: template default, which judges `debug.log` against `$input`, `$auth` and `$env`. Reports `payments/charge`.

Then one policy of our own, `PCI-CARD-001`, for what no template covers:
- `table.tag_required`: any table with `card_number`, `card_cvv`, `card_expiry`, or `cardholder_name` must carry tag `pci`.
- `table.field_attribute_required` with `forbidden = true` on `card_number`, `card_cvv`, `cvv`, `cvc`, `pan`: no table may store a full card number or security code. Reports `payments.card_number` and `payments.card_cvv`.
- `statement.expression_rule` on `datadog.log` (`message`, `attributes`): must not reference `$input`, `$auth` or `$env`. The template covers `debug.log` only, and the recipe asks for `datadog.log` too.

## 4. What stays unchecked

- Whether the policies pass today. They will not: the findings above are real and are the work left for you.
- Field values at runtime. Policies read stored definitions, not records or request payloads.
- What Stripe or Plaid do with the data after it leaves. VND-001 checks the destination, not the payload.
- Access reviews, change approvals, people and training, encryption at rest, network controls, and the PCI scope decision itself.
- Bank account numbers are covered as sensitive and kept out of responses. The ask names cardholder data, so I did not forbid storing them raw.

---

# Result

## What I built and changed

- **Tables changed:** `payments` (tag `pci`; `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number`, `bank_routing_number` marked `sensitive`) and `payment_method` (tag `pci`; `card_last4` marked `sensitive`). Files: `workspace/table/payments.xs`, `workspace/table/payment_method.xs`.
- **Policies created** (`workspace/policies/`, all `active = true`, `enforcement = "advisory"`): `SEC-012`, `VND-001` (hosts `api.stripe.com`, `production.plaid.com`), `SEC-011`, `CONF-011`, `DATA-010`, `LOG-001`, `PCI-CARD-001`.
- **Nothing else changed.** No new functions, endpoints or middleware. The existing `payments/charge` and `payments/fraud_check` are untouched.

## Dry run

`xano workspace push -d ./workspace --dry-run`: 7 policies to create, 2 tables to update, no blocked objects, no reference warnings. Each policy also parses with no rule warnings. I did not evaluate the policies, so I do not know their current findings.

## Before you push

The policies are advisory, so they will report the following as findings and will not block anything. These are things I found by reading the code, not by running the policies:

1. **`payments/charge` writes raw card data to the database.** `card_number` and `card_cvv` go into `payments`. `PCI-CARD-001` will report this (the raw-storage rule). Fixing it means removing those fields and changing stored data, which I did not do.
2. **`payments/charge` logs the whole request.** `debug.log` writes `$input`. `LOG-001` will report it. The fix is to log an event (for example the invoice id), not the input. I did not change the code.
3. **`payments/fraud_check` sends the card number to `api.riskscreen.example`.** That host is not Stripe or Plaid, so `VND-001` will report it. Removing the call or approving the vendor is your decision.
4. **`debug.log` and `datadog.log` elsewhere.** Other stacks may use these; `LOG-001` and `PCI-CARD-001` will report any that reference input, auth or env.
5. **Vendor rule covers all outbound HTTP.** `VND-001` applies to every `api.request` in the workspace, not only card flows. Other vendors used by non-card endpoints (for example the SMS, tracking and shipping calls) will show as findings too. If you want the rule limited to card flows, that needs a scope change.

## What no object or policy here can see

- Runtime data: what a request actually sends, what is stored, and what Stripe or Plaid do with it.
- Infrastructure: encryption at rest, network segmentation, backups, scans, and penetration tests.
- Access reviews, change approvals, and staff training.
- Whether `pci` is the right scope. A QSA decides which systems are in PCI scope.
- Bank account numbers are covered as sensitive and kept out of responses. The ask names cardholder data, so I did not forbid storing them raw.
- No audit function exists to record card access, so `object.tagged_table_access` is not used.

# Plan: PCI card-data policies

You asked for three things: cardholder data is never logged, never stored raw, and never sent to a vendor outside Stripe and Plaid. I read the workspace and found the places where that already breaks, so the plan covers both the policies and the changes needed to make them pass.

## Objects I will build

None. A policy can't do work at runtime, and nothing in the ask needs a new function, table or middleware. The enforcement is the change to the existing charge endpoint below.

## Changes to existing objects

| Object | File | Change |
| --- | --- | --- |
| `payments/charge` (query, POST) | `workspace/api/app/payments/charge_POST.xs` | Delete the `debug.log` that writes the whole input (it logs the card number, CVV, expiry and cardholder name). Remove `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` from the `db.add payments` data, so they are no longer written. |

I will not remove the card columns from the `payments` table. Dropping a column loses data on push, so that is your call. The policy reports the table until you do.

I will not change `fraud_check_POST` (it sends the card number to `api.riskscreen.example`, which is not on your list). Removing that call changes what the endpoint does, so it is your decision, and the vendor policy reports it.

I will not touch `acme_notify_sms` (a credentialed URL written in code). Moving the secret to an environment variable has to be done by you, with the secret rotated.

## Policies

Each template is its own policy, as the recipe for protecting card data says. The card-specific rule goes in its own policy. All are `active = true` and `enforcement = "advisory"`.

1. **SEC-012** (`no_secrets_in_code`): `literal.credential_shape`, no params. Keeps every credential out of code. This catches the Twilio credentials in `acme_notify_sms`.
2. **VND-001** (`approved_vendors_only`): `outbound.vendor_allowlist` with `hosts: ["api.stripe.com", "production.plaid.com"]`, all kinds. Keeps data going only to Stripe and Plaid. The hosts are the ones your code uses today. Every other outbound call is reported as not approved: Riskscreen, ShipFast, Twilio, Resend, OpenAI and Anthropic.
3. **SEC-011** (`tls_verification_on`): `statement.param_forbidden` on `verify_peer` and `verify_host`. Keeps TLS checks on for the Stripe and Plaid calls.
4. **CONF-011** (`sensitive_fields_marked`): `table.field_attribute_required` with `field_names: ["card_last4"]`. Marks the card field we still store as sensitive.
5. **LOG-001** (`no_sensitive_data_in_logs`): `statement.expression_rule` on `debug.log` `value`, forbidding `$input`, `$auth` and `$env`. Keeps request input out of logs. This catches the `charge` debug log.
6. **PCI-CHD-001** (own policy): `table.field_attribute_required` with `forbidden: true` on `card_number`, `card_cvv`, `card_cvc`, `cvv`, `cvc`, `pan`, `card_expiry`, `cardholder_name`. Card numbers, security codes, expiry and cardholder name are never stored. This catches the `payments` table.

## What stays unchecked

- Whether a value that gets logged or sent is cardholder data. The rules read names and literal settings, not runtime values. A value passed through a variable the rules can't trace is not reported.
- What Stripe and Plaid do with the data after it is sent.
- Whether the Stripe call itself is correct. `charge` posts an amount to Stripe without a payment method, so the charge is incomplete. That is an existing bug, not part of this change.
- Encryption at rest, network controls, access reviews, staff training and retention of stored data. No policy in this kit can see those.
- Bank account numbers and routing numbers. Your ask names cardholder data, so I have not added them. Say so if you want them forbidden too.
- Responses. A response that returns card data is not covered by this change.

## Build results

**Changed**
- `payments/charge` (`workspace/api/app/payments/charge_POST.xs`): removed the debug log of the input, and stopped writing the card number, CVV, expiry and cardholder name to `payments`.

**Written** (all `active = true`, `enforcement = "advisory"`, in `workspace/policies/`)
- `SEC-012`: no hardcoded credentials.
- `VND-001`: outbound calls only to `api.stripe.com` and `production.plaid.com`.
- `SEC-011`: TLS verification stays on for `api.request`.
- `CONF-011`: `card_last4` marked sensitive.
- `LOG-001`: `debug.log` never references `$input`, `$auth` or `$env`.
- `PCI-CHD-001`: no table declares card number, CVV/CVC, PAN, expiry or cardholder name.

Each policy parses. `xano workspace push --dry-run` reports six policies to create and one endpoint to update (`payments/charge`), with no blocked objects and no reference warnings. The dry run does not evaluate the policies, so it does not show findings.

## What to know before you push

These findings will show up once the policies run, because the code still does these things:

1. **`payments` table** declares `card_number`, `card_cvv`, `card_expiry` and `cardholder_name`. `PCI-CHD-001` will report it. Removing those columns deletes stored data, so that decision is yours.
2. **`fraud_check` endpoint** sends the card number to `api.riskscreen.example`. `VND-001` will report it. Remove the call or approve the vendor.
3. **`acme_notify_sms`** has Twilio credentials written into its URL. `SEC-012` will report it. Move them to an environment variable and rotate the value. I have not touched it.
4. **Other unapproved vendors**: ShipFast, Resend, OpenAI and Anthropic. `VND-001` reports them too, which is correct under a strict list.
5. **`charge` is incomplete.** It posts an amount to Stripe with no payment method, so it will not take a card payment as written. I did not fix the payment flow.
6. **Advisory only.** These policies report and block nothing. Making them blocking is your decision, and it would stop merges and pushes that introduce a finding.

## What no policy here can see

- Whether a value is cardholder data. Rules read names and literal settings, not runtime values. A card number moved through a variable or a function may not be traced.
- What Stripe or Plaid do with data after it is sent.
- Encryption at rest, network controls, backups, access reviews, staff training and data retention.
- Bank account and routing numbers. Your ask named cardholder data, so I have not forbidden these. Tell me if you want them added to `PCI-CHD-001`.
- Responses: a response that returns card data is not covered.
- The request still accepts the card fields as inputs. They are now unused, and nothing in these policies reports that.

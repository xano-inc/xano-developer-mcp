I've drafted three policies for the cardholder data rules. They parse, but I haven't published or evaluated them, so nothing is live yet. A policy can show you where you fall short. It can't make you pass a PCI audit by itself, and the audit covers things policies can't see (see the end).

## What I drafted

**PCI-001: Card numbers and security codes are never stored** (critical, advisory)
Forbids any table from declaring `card_number`, `card_cvv`, `cvv`, `cvc`, `pan` or `track_data`. This is the "can't be stored raw" rule.

**PCI-002: Logs never contain request, user or secret data** (high, advisory)
Checks `debug.log` and `datadog.log` for references to `$input`, `$auth` or `$env`. This is the "can't be logged" rule.

**PCI-003: Data only goes to approved vendors (Stripe and Plaid)** (high, advisory)
Allows outbound requests only to `api.stripe.com` and `production.plaid.com`. Cloud, email and AI model providers are also reported, since none are on the list. This is the vendor rule.

All three are `active = true` and `enforcement = "advisory"`. Their findings will show up without blocking merges. If you want them to block, that's a decision for the policy owner: a blocking policy would refuse any change that introduces a finding.

## What I found in your workspace (from reading the files, not from an evaluation)

- **`payments` stores raw card data.** It has `card_number`, `card_cvv`, and `cardholder_name` fields, and `api/app/payments/charge_POST.xs` writes the full card number and CVV into it. PCI-001 will flag this table.
- **`charge_POST` logs the full input.** Its first statement is `debug.log` with `$input|json_encode`, so the card number, CVV and cardholder name go to the log. PCI-002 will flag it.
- **`api/app/payments/fraud_check_POST.xs` sends the card number to `api.riskscreen.example`**, which is not on your list. PCI-003 will flag it.
- **Other non-approved destinations** that PCI-003 will also report: `api.shipfast.example` (shipping), `api.twilio.com` (SMS), Resend (email, `acme_send_invoice_email` and `send_customer_email`), and the Anthropic and OpenAI agents. Most of these don't carry card data, but the vendor check can't tell what data goes where, so it reports all of them.
- **Outside your question, but serious:** `function/acme_notify_sms.xs` has a Twilio account credential written directly in the URL. The SEC-012 "no secrets in code" check would catch that. I'd rotate that credential now regardless of the audit.

## What the policies don't cover

- **Bank account data.** `payments` also stores `bank_account_number` and `bank_routing_number`, and `bank_accounts/link_POST` takes them as input. These aren't card data, so I didn't write a rule for them. If your audit or your definition of "bank data" covers them, I can add a rule the same way.
- **Whether data actually reaches the logs or vendors at runtime.** The policies read definitions only. They can't see records in tables or what a request sent.
- **Encryption at rest, network segmentation, backups, penetration tests, access reviews, change approvals and security training.** These are infrastructure or people controls, outside what a policy can judge.
- **Fields that hold card-adjacent data under other names.** The rules match exact field names. Anything you call something else, such as `pan_last_digits` or `acct_no`, won't be caught. Add names to the lists if you use them.
- **Plaid sandbox.** I only approved `production.plaid.com`. If you call `sandbox.plaid.com` from the same code, it will be flagged. Tell me if you want it approved.
- **Marking fields sensitive or tagging tables.** Your tables have no tags and no fields marked sensitive, so I didn't write rules that depend on them.

## What I'd do next

1. Fix `payments`: drop the card and CVV fields and store the Stripe payment intent ID and last four digits only. Remove the `debug.log` from `charge_POST`, and send card data to Stripe without touching a database field.
2. Decide on `riskscreen` and the other vendors: approve them, or remove them.
3. Rotate the Twilio credential.
4. Publish the three policies after you've checked the findings, then decide whether any should block.

I've drafted seven policies in `out/` for the cardholder rules. Nothing is published or pushed yet, and I haven't changed your workspace. A policy can't make you pass a PCI audit. It checks that the stored definitions match a rule, and it can't see runtime data, access reviews, or infrastructure. What it can do is catch the places where your code breaks these rules.

**What I wrote**

| File | Covers | What it checks |
| --- | --- | --- |
| `PCI-001.xs` | Cardholder data is never stored | Forbids any table from declaring card number, CVV, expiry or cardholder name |
| `CONF-011.xs` | Cardholder fields are marked sensitive | Those fields are marked sensitive, so they stay out of responses |
| `DATA-010.xs` | Endpoints don't return cardholder data | Endpoint queries don't fetch those fields |
| `LOG-001.xs` | Cardholder data is never logged | `debug.log` and `datadog.log` don't reference request input, the user, or env values |
| `VND-001.xs` | Only approved vendors | Outbound calls go only to `api.stripe.com` and `production.plaid.com` |
| `SEC-012.xs` | No hardcoded secrets | Flags credentials written as literals |
| `SEC-011.xs` | TLS verification stays on | Flags requests with certificate or host checks turned off |

All seven are active and advisory, so none of them blocks a merge or push. Making one blocking is your owner's decision. I parsed each file with `xano policy parse` and they all pass with no warnings. I haven't run `xano policy evaluate`, so the findings below are predictions from reading the code, not results.

**What I expect the policies to flag now**

- `payments` (`table/payments.xs`) stores `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` as plain text. PCI-001 and CONF-011 should both flag it.
- `api/app/payments/charge_POST.xs` logs `"charge attempt " ~ $input` with `debug.log`, and that input includes the card number and CVV. LOG-001 should flag it. It also writes those raw card fields to `payments`.
- `api/app/payments/fraud_check_POST.xs` sends the card number to `api.riskscreen.example`, which is not on your list. VND-001 should flag it. This is a direct card-data flow to an unapproved vendor.
- `function/acme_notify_sms.xs` has a Twilio credential in its URL. SEC-012 should flag it. Move it to an environment variable and rotate the exposed value. I haven't repeated it here.
- VND-001 will also flag ShipFast calls (quote, tracking, rate sync), the Twilio SMS call, the AI agent runs, and email sends. The vendor check looks at every outbound destination, not only the ones that carry card data. No check can tell which calls carry card data, so this is broader than your ask. If you want it narrower, tag the card tables and I can scope the rule to objects that reach them. That needs the tags to exist first.

**Decisions I need from you**

1. `charge_POST` sends only the amount to Stripe and never the card. It stores the raw card instead. Do you want to keep that flow, or move card capture to Stripe tokens so no table holds card fields? I haven't changed any code.
2. `fraud_check_POST` can be removed or pointed at an approved processor. Which do you want?
3. Should `bank_account_number` and `bank_routing_number` in `payments` be covered too? They aren't cardholder data, so I left them out.
4. Do you want `cardholder_name` and `card_expiry` treated as forbidden to store? I included them because you said cardholder data can't be stored raw. Tell me if you read that narrower.

**Not covered by these policies**

- The vendor rule checks where requests go, not what they carry. Nothing checks card data inside a request body.
- Who can call the payment endpoints. That needs `CONF-010`, which needs your sensitive tables to be tagged.
- Encryption at rest, network controls, access reviews, staff training, and log retention in Datadog. These are infrastructure or process controls, not workspace definitions.
- Anything written at runtime or copied between environments.

Let me know which of the decisions above you want and I'll update the files. Then I can give you the exact `xano policy evaluate` output.

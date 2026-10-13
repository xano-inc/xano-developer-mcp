# Plan: PCI card-data policies for policy-authoring-eval

## Objects I will build
None. Policies can check everything in the ask that is visible in stored definitions, and no new runtime object is needed to make them do it.

## Changes to existing objects
None. The workspace currently does four things that would fail this policy, and fixing them changes behaviour, so I am leaving them for you to decide (see "Findings to expect"):
- `payments/charge` (`api/app/payments/charge_POST.xs`) writes `card_number`, `card_cvv`, `card_expiry` and `cardholder_name` into `payments`, and logs `$input`.
- `payments/fraud_check` sends `card_number` to `api.riskscreen.example`.
- `payments` and `clinical_notes` log request input with `debug.log`.
- `acme_notify_sms` has a literal Twilio credential in its URL.

## Policies (all `active = true`, `enforcement = advisory`)
| Key | Source | What it keeps true |
|---|---|---|
| SEC-012 | template | No API key, token or credentialed URL is written as a literal in code (covers the Twilio literal). |
| VND-001 | template | Outbound requests only reach `api.stripe.com` and `production.plaid.com`. Agent LLM providers and email/cloud providers are reported as not yet reviewed. |
| SEC-011 | template | No `api.request` or `stream.from_request` turns off `verify_peer` or `verify_host`. |
| CONF-011 | template | `card_last4`, `bank_account_number` and `bank_routing_number` are marked sensitive wherever declared. |
| DATA-010 | template | No query reads `card_number`, `card_cvv`, `card_expiry`, `cardholder_name`, `bank_account_number` or `bank_routing_number` (or a sensitive field) into its output. |
| LOG-001 | template | No `debug.log` value references `$input`, `$auth` or `$env`. |
| PCI-010 | own key, extra rules | (1) No table declares `card_number`, `cvv`, `cvc` or `pan`. (2) No table declares `card_expiry` or `cardholder_name`. (3) `datadog.log` message and attributes never reference `$input`. |

## What stays unchecked
- The response of an endpoint. No check reads `response`, so `payments/charge` returning `$payment` with its stored card columns is not caught by DATA-010.
- Whether data sent to an approved vendor is itself allowed. VND-001 checks the destination host only.
- Vendors built at runtime from a variable are reported as unresolved, not judged.
- Anything outside stored definitions: people, access reviews, runtime data, infrastructure, encryption at rest, and the vendor contracts themselves.
- Bank account numbers are not cardholder data under PCI. I have marked them sensitive (CONF-011) but not forbidden them. Forbidding them is your call.
- Policies do not make the workspace PCI compliant. A pass only means the stored definitions matched each rule when it ran.

---

# Result

## What I built and changed
- **Built:** seven policy files under `workspace/policies/`: `SEC-012.xs`, `VND-001.xs`, `SEC-011.xs`, `CONF-011.xs`, `DATA-010.xs`, `LOG-001.xs`, `PCI-010.xs`. All are `active = true` and `enforcement = "advisory"`, so none of them blocks a push.
- **Objects built or changed:** none. Application code is untouched.
- **Parse:** all seven parse with exit 0.
- **Dry run:** `xano workspace push -d ./workspace --dry-run` exits 0 and lists `+7 created` policy (CONF-011, DATA-010, LOG-001, PCI-010, SEC-011, SEC-012, VND-001). No findings are reported, because a dry run does not evaluate.

I did not run `xano policy evaluate` or a real push. Those are outside what I am permitted to run here. The findings below are predictions from reading the workspace files, and you should confirm them with `xano workspace push` or `xano policy evaluate`.

## Predicted findings (not run)
- **LOG-001:** `payments/charge` logs `$input` with `debug.log`, and `clinical_notes` logs `$input[""]`. Expect both to be reported.
- **PCI-010:** `payments` declares `card_number`, `card_cvv`, `cardholder_name` and `card_expiry`. Expect the card-number/CVV rule and the cardholder/expiry rule to report that table.
- **CONF-011:** `payment_method.card_last4`, `payments.bank_account_number` and `payments.bank_routing_number` are not marked sensitive. Expect three findings.
- **SEC-012:** `function/acme_notify_sms` has a Twilio credential written into its URL. Expect it to be reported as a literal credential. I have not repeated the value here.
- **VND-001:** every outbound host other than `api.stripe.com` and `production.plaid.com` should be reported. That includes `api.shipfast.example`, `api.riskscreen.example` (the fraud check, which sends `card_number` to it), `api.twilio.com`, and the agents' OpenAI and Anthropic providers. Email providers (`resend`) may also be reported.
- **SEC-011:** I found no `verify_peer` or `verify_host` set to false, so I expect no finding.
- **DATA-010:** I found no query with an explicit output list naming these fields, so I expect no finding. This is weak evidence (see below).

## What the customer should know before pushing
1. **The policies will fail on the current code.** The workspace stores raw card numbers and CVVs in `payments`, logs request input, and sends card numbers to a fraud vendor that is not on the approved list. Pushing these policies will not fix any of that. Fixing it means changing behaviour (the charge flow would have to tokenise through Stripe, and the stored columns would have to be dropped). That is a decision for you, so I did not make it.
2. **The vendor rule is workspace-wide.** `VND-001` checks every outbound destination, not only cardholder flows. It cannot tell which data goes to which host. Whether a non-approved vendor receives card data is only partly visible: it shows the host, not the payload.
3. **Gaps no check can see:**
   - **Responses.** No check reads an endpoint's `response`. `payments/charge` returns `$payment`, which includes the stored card columns. DATA-010 does not catch that.
   - **Vendor payloads.** VND-001 does not inspect what is sent to an approved vendor.
   - **Runtime and storage.** Encryption at rest, backups, copies between environments, and the data already in the database.
   - **People and process.** Access reviews, training, change approvals and the PCI scope itself. A pass only means the stored definitions matched each rule when it ran. It does not make the workspace PCI compliant.
4. **Bank numbers are not cardholder data.** I marked them sensitive (CONF-011) but did not forbid storing them. If you want them forbidden, say so.
5. **Plaid host.** I approved `production.plaid.com` only, because that is what the workspace uses. Add `sandbox.plaid.com` if you test against it.
6. **Stripe key handling.** Stripe calls read `$env.STRIPE_SECRET_KEY`, so SEC-012 should not flag them.
7. **Cardholder name and expiry.** PCI-010 forbids storing them. PCI DSS permits them when the PAN is protected, so this is stricter than the standard. That matches your "can't be stored raw" wording, but confirm it with your QSA.
8. **Blocking is your call.** These are advisory. Making them blocking would stop merges and set-lives that introduce findings. That is the policy owner's decision.

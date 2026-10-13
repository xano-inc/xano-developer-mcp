Hi, I looked at your workspace and wrote two policies for the two parts of your ask. Neither is published yet, and as things stand neither one checks anything: both rules depend on tags your workspace doesn't have yet. Details below.

**1. Account deletion erases personal data everywhere** (`out/GDPR-ERASURE.xs`, key `GDPR-ERASURE`)

The rule requires that every table tagged `personal` is deleted from by a function tagged `erasure`. Your account deletion calls `delete_user_account`, but it only deletes from `user_address`, `sessions` and `users`. Other tables hold a user's data as well: `orders`, `invoices`, `payments`, `payment_method`, `support_tickets`, `customer_notes`, `shipments`, `newsletter_subscribers` and the clinic tables (`patients`, `appointments`, `clinical_notes`). Once those are tagged `personal`, the rule will flag the gap.

**2. Retained data has a cleanup task** (`out/RET-002.xs`, key `RET-002`)

The rule requires that every table tagged `retained` has a scheduled task that deletes from it. Your nightly `purge_expired_sessions` task covers `sessions`, so tagging `sessions` as `retained` would pass. This rule does not check retention age: it cannot tell whether a record is deleted after two years. The age is in the task's own query, so `purge_expired_sessions` (which deletes by `expires_at`) needs to be checked against your two-year limit by you.

**What I need from you (I have not changed the workspace)**

- Decide on two tags: `personal` on the tables that hold personal data, and `retained` on the tables that have a retention limit. I've listed candidates above, but the classification is yours.
- Decide on the erasure function. The rule expects one function tagged `erasure` to delete from every `personal` table. Either extend `delete_user_account` to cover the tables above, or name the function you want. I haven't made that change, because it deletes customer data and changes behaviour.
- Decide on the two-year limit. The retention age has to be set in each cleanup task's query. No check reads it.

**What the policies cannot see**

- Copies at third parties: your card processor (`payment_method`), email provider, and the AI summariser's outputs are not reached by deletion in the workspace, and no check reads what a vendor deletes.
- Backups, logs and environment copies. These are outside the workspace definitions.
- Whether a deletion request is fulfilled in time. That is an organisational process.

Both policies are `active` and `advisory`, so they block nothing. Making either one blocking is your policy owner's choice.

Once the tags exist I can run `xano policy evaluate` to show which tables and functions the rules judge.

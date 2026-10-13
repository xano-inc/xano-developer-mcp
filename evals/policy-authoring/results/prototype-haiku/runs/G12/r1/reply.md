I could not write a Xano policy for this one, because none of its parts can be checked by a policy.

- Production data never ending up in staging is about what gets copied between environments. No check reads that. Xano policies only inspect the stored definitions of objects on a branch, so they cannot see a data copy or a restore.
- Devs only getting into prod through the on-call process is about who has access and how access is approved. Policies don't check people, roles or approval workflows.

What can help is a process control outside the policy system: restrict prod access through your identity provider and your on-call tooling, and handle data refresh into staging through a documented runbook. If you want a partial code-level guardrail, I can look at a policy that makes each environment's outbound destinations come from environment variables, but that does not stop data copies, so it would not satisfy this ask on its own.

Nothing was created, published or pushed.

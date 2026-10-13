I've drafted two Xano policies for your AI agents. They are not published yet, and I could not check them against your workspace.

- **AGENT-010 (AI tools can't delete data):** no AI tool may run a delete, truncate or raw SQL statement, directly or through a function it calls. This covers the "can't delete anything" part.
- **AGENT-020 (Customer-facing AI tools need human approval):** an AI tool tagged `sends-email` must call `request_human_approval` on every path before it acts. This only applies to tools you tag, so you need to tag every tool that emails customers.

What is not covered:
- **Emailing customers without approval** is only partly covered. AGENT-020 checks that the approval function is called, not that it runs before the email is sent, and it cannot see the approval itself. Xano has no check for a human approving an action, so the approval step must be built in your tools.
- **Tools you haven't given the agent** cannot be checked. No policy check compares an agent's enabled tools against a list. You will need to review each agent's tool list yourself.

Assumptions to confirm: the approval function is named `request_human_approval` and does not exist yet, and the `sends-email` tag does not exist yet. Until both exist, AGENT-020 matches nothing. Both policies are advisory, so they block nothing.

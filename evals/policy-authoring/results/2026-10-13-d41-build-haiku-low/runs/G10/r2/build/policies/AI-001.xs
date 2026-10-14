policy "AI-001" {
  title = "AI agents use only approved tools"
  statement = "Each AI agent enables only the tools on the approved list. A new tool needs its name added to the list by its owner before an agent can enable it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai", "agents"]

  rule {
    check = "agent.tool_allowlist"
    params = { tools: ["lookup_order", "issue_refund", "send_customer_email"] }
  }
}

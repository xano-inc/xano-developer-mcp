policy "AI-001" {
  title = "AI agents use only approved tools"
  statement = "Every AI agent enables only the tools the owner has approved by name. Any other tool an agent enables is reported, and the owner decides whether to approve it or remove it from the agent."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "agent.tool_allowlist"
    params = {tools: ["lookup_order", "send_customer_email", "issue_refund"], object_kinds: ["agent"]}
  }
}

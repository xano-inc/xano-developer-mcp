policy "AGENT-001" {
  title = "Agents use only approved tools, and deletes and emails wait for approval"
  statement = "AI agents enable only the tools the owner has approved. Every tool that deletes a record or sends an email calls require_approval first, so a person must approve the action."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agents"]

  rule {
    title = "Support Agent enables only its approved tools"
    check = "agent.tool_allowlist"
    params = {
      object_kinds: ["agent"]
      tools: ["lookup_order", "delete_customer_note", "send_customer_email", "issue_refund"]
    }
  }

  rule {
    title = "Deletes and emails in tools wait for require_approval"
    check = "stack.statement_order"
    params = {
      before: {functions: ["require_approval"]}
      after: ["db.del", "db.bulk.delete", "util.send_email"]
      object_kinds: ["tool"]
    }
  }
}

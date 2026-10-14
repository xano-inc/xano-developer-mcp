policy "AI-010" {
  title = "Agent tools cannot delete, and emails wait for approval"
  statement = "AI agent tools never delete records. Every email a tool sends must run after the require_approval check, which stops unless a human has approved the action. An approval is given through the approvals endpoint."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai", "agents", "approval"]

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"] }
  }

  rule {
    check = "stack.statement_order"
    params = { before: { functions: ["require_approval"] }, after: ["util.send_email"], object_kinds: ["tool"] }
  }
}

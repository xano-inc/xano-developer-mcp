policy "AGENT-010" {
  title = "Agent tools get human approval before deleting or emailing"
  statement = "An AI agent tool must call request_human_approval before any database delete or customer email, so a person approves the action first."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["agents", "human-approval"]

  rule {
    check = "stack.statement_order"
    params = {
      before: {functions: ["request_human_approval"]}
      after: ["db.del", "db.bulk.delete", "util.send_email"]
      object_kinds: ["tool"]
    }
  }
}

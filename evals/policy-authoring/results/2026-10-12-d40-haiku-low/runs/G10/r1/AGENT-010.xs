policy "AGENT-010" {
  title = "AI agent tools need a person's approval before deleting or emailing"
  statement = "An AI agent tool must not delete records or send email unless a person has approved the action first. Each tool that deletes a record or sends an email must call request_human_approval before that statement runs, and that call stops the tool until a person approves the request in the back office. This policy checks the order of the calls only; it cannot tell whether the approval function decides correctly."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_order"
    params = {
      before: {functions: ["request_human_approval"]}
      after: ["db.del", "db.bulk.delete", "util.send_email"]
      object_kinds: ["tool"]
    }
  }
}

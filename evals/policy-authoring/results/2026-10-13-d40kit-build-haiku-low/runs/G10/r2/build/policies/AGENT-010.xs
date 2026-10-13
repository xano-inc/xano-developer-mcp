policy "AGENT-010" {
  title = "AI agents wait for human approval before deleting or emailing"
  statement = "An AI agent tool may delete records or send email only after require_human_approval has run in the same tool. A person approves each action in approval_requests first. Tools that do neither are not affected."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_order"
    params = {before: {functions: ["require_human_approval"]}, after: ["db.del", "db.bulk.delete", "db.truncate", "util.send_email"], object_kinds: ["tool"]}
  }
}

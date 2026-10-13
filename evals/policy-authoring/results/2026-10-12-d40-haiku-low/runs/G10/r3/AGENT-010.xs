policy "AGENT-010" {
  title = "AI agent tools wait for human approval before deleting or emailing"
  statement = "An AI agent tool may delete records or send email only after a person has approved the action. Each such tool calls request_human_approval before the delete or email runs, as issue_refund does. A tool that cannot wait for approval is exempted by the policy owner, not by editing this rule."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_order"
    params = {
      before: { functions: ["request_human_approval"] }
      after: ["db.del", "db.bulk.delete", "db.truncate", "db.direct_query", "util.send_email"]
      object_kinds: ["tool"]
    }
  }
}

policy "AGENT-010" {
  title = "AI agent tools don't delete records or email customers without approval"
  statement = "AI agent tools must not delete records: no db.del, db.bulk.delete or db.truncate in a tool, or in a function a tool calls. A tool that emails a customer (util.send_email) must call request_human_approval first, so a person approves the email before it is sent. A tool that cannot comply is exempted by the policy owner, never by its author."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_forbidden"
    params = {
      statements: ["db.del", "db.bulk.delete", "db.truncate"]
      object_kinds: ["tool"]
    }
  }

  rule {
    check = "stack.statement_order"
    params = {
      before: {functions: ["request_human_approval"]}
      after: ["util.send_email"]
      object_kinds: ["tool"]
    }
  }
}

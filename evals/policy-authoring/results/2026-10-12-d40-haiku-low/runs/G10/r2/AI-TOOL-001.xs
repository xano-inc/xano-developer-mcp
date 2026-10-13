policy "AI-TOOL-001" {
  title = "AI agent tools can't delete records or email without approval"
  statement = "AI agent tools never delete records: no db.del, db.bulk.delete, db.truncate or raw SQL in a tool, or in a function a tool calls. Every tool that sends an email calls request_human_approval before the email, so a person approves it first. A tool that must delete or email is exempted by the policy owner, not by its author."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.delete", "db.truncate", "db.direct_query"], object_kinds: ["tool"] }
  }

  rule {
    check = "stack.statement_order"
    params = { before: {functions: ["request_human_approval"]}, after: ["util.send_email"], object_kinds: ["tool"] }
  }
}

policy "AGENT-GUARD" {
  title = "AI tools can't delete, and their emails wait for a human approval"
  statement = "AI tools never delete records, directly or through a function they call. Every tool that sends an email calls require_approval first, which stops unless a human has approved that action on that recipient in the approvals table. A tool that needs to delete must be redesigned with its owner, not exempted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "stack.statement_forbidden"
    params = {statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"]}
  }

  rule {
    check = "stack.statement_order"
    params = {before: {functions: ["require_approval"]}, after: ["util.send_email"], object_kinds: ["tool"]}
  }
}

policy "HITL-001" {
  title = "AI agents can't delete records or email customers without a person's approval"
  statement = "AI tools never delete records, including through a function they call. Any AI tool that sends email must first call require_human_approval, which stops the send unless a person has set the email's approval row to approved. A tool that is not given a delete or email step is not affected."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"] }
  }

  rule {
    check = "stack.statement_order"
    params = { before: { functions: ["require_human_approval"] }, after: ["util.send_email"], object_kinds: ["tool"] }
  }
}

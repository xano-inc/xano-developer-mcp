policy "AGENT-SAFE-001" {
  title = "AI tools never delete records or send email directly"
  statement = "AI tools never delete records or send email on their own. A delete or an email is queued in pending_actions for a person to approve, and the approved action runs outside the tool. This covers statements inside a function a tool calls."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"] }
  }

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["util.send_email"], object_kinds: ["tool"] }
  }
}

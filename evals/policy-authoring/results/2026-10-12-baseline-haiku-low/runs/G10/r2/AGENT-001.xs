policy "AGENT-001" {
  title = "AI agent tools don't delete data"
  statement = "AI agent tools must not delete records. A tool that deletes data (a db.del or db.bulk.* delete, directly or through a function it calls) is reported. Deletes that a person must approve happen outside agent tools, in the back office."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.*"], object_kinds: ["tool"] }
  }
}

policy "AGENT-001" {
  title = "AI agent tools don't delete data"
  statement = "No AI agent tool may delete records. A tool that deletes data, directly or through a function it calls, must be removed or changed to archive or flag the record instead."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agents"]

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.delete"], object_kinds: ["tool"] }
  }
}

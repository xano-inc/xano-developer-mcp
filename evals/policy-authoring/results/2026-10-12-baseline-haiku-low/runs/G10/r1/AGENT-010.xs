policy "AGENT-010" {
  title = "AI agent tools don't delete data"
  statement = "AI agent tools must not delete or truncate records. A tool that needs to remove data is a person's job, done outside the agent."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agents"]

  rule {
    check = "stack.statement_forbidden"
    params = {statements: ["db.del", "db.truncate"], object_kinds: ["tool"]}
  }
}

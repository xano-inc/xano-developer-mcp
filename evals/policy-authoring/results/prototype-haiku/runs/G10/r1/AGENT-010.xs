policy "AGENT-010" {
  title = "AI tools can't delete data"
  statement = "No AI tool deletes or truncates records or runs raw SQL, directly or through a function it calls. Deleting data is destructive and must be done by people outside the agent. Tools are judged on their own stacks and on the functions they call."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agent"]

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["db.del", "db.bulk.delete", "db.truncate", "db.direct_query"], object_kinds: ["tool"] }
  }
}

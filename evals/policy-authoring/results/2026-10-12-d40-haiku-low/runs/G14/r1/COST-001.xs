policy "COST-001" {
  title = "AI calls stay out of loops and background tasks don't loop with while"
  statement = "AI agent and MCP tool calls are never made inside a foreach, for or while loop, so one run cannot repeat an AI call per record. Background tasks do not use while loops, the shape that retries until something succeeds."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = {statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"]}
  }

  rule {
    check = "stack.statement_forbidden"
    params = {statements: ["while"], object_kinds: ["task"]}
  }
}

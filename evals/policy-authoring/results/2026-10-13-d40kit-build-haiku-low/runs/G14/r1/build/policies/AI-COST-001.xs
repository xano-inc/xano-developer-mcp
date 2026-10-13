policy "AI-COST-001" {
  title = "AI calls stay out of loops"
  statement = "AI agent runs and external MCP tool runs must not sit inside a foreach, for or while loop, where one request can run up unbounded model spend."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = {statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"]}
  }
}

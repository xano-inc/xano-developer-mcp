policy "COST-010" {
  title = "AI calls are never made inside a loop"
  statement = "No AI agent or external MCP call runs inside a foreach, for or while loop, so one run cannot make an unbounded number of paid model calls."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = { statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"] }
  }
}

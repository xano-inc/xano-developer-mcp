policy "AI-COST-001" {
  title = "AI calls stay out of loops"
  statement = "An AI agent run or external MCP tool call must not sit inside a loop. A loop multiplies each call by its iteration count, which runs up model spend. An AI call that truly must repeat must be moved out of the loop or reviewed and exempted by the policy owner."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {
      statements: ["ai.agent.run", "ai.external.mcp.tool.run"]
      must_not_be_inside: ["foreach", "for", "while"]
    }
  }
}

policy "COST-001" {
  title = "AI calls are never made inside a loop"
  statement = "AI agent calls and MCP tool calls are never made inside a loop, so a loop over many rows or retries cannot repeat a paid model call each time round. A call that must run for many items is moved out of the loop, or its owner decides on an exemption. This policy does not cap spend: no check reads what a call costs."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = { statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"] }
  }
}

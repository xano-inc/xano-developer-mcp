policy "COST-001" {
  title = "AI calls and retried requests stay out of loops"
  statement = "An AI agent call or MCP tool run is never made inside a foreach, for or while loop, because each pass bills a model call. An outbound api.request is never made inside a while loop, where a failing call can repeat without end. This does not cap spend or retry counts: those are not checked. A call made from a function that a loop calls is not seen. An object that must loop is exempted by the policy owner, not by its author."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"] }
  }

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_not_be_inside: ["while"] }
  }
}

policy "SPEND-GUARD" {
  title = "AI calls and task retries stay out of loops"
  statement = "AI calls (agent runs and MCP tool runs) are never made inside a foreach, for or while loop, where one request can fan out into many billed calls. Background tasks never make an outbound request inside a while loop, the shape that retries forever. This is a proxy: it does not cap spend, and it does not bound retries counted with a for or foreach. Spend caps and retry limits are not checked by any rule."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = { statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"] }
  }

  rule {
    check = "statement.containment"
    params = { statements: ["api.request"], must_not_be_inside: ["while"], object_kinds: ["task"] }
  }
}

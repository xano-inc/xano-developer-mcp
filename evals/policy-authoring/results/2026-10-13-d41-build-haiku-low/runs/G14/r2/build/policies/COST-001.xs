policy "COST-001" {
  title = "AI calls and background retries stay bounded"
  statement = "AI agent and MCP tool calls are never made inside a loop, so one run cannot multiply into an unbounded bill. Background tasks use no while loop, so a failing step cannot keep retrying. The while rule is an approximation: it bans the loop shape, not every other way a task can retry. Spend caps and retry limits are not checked by this policy."
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

  rule {
    check = "stack.statement_forbidden"
    params = {
      statements: ["while"]
      object_kinds: ["task"]
    }
  }
}

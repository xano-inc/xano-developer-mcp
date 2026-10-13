policy "COST-001" {
  title = "AI calls and retried requests stay out of loops"
  statement = "AI model calls (agent runs and MCP tool runs) are never made inside a loop, so one loop cannot multiply the spend. External HTTP requests are never made inside a while loop, so a retry that repeats until it succeeds cannot run forever. A call that must repeat moves out of the loop and runs a bounded number of times. This policy reads only the loops in each stack: it does not read how often a task runs, retry settings, token counts or what a call costs."
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

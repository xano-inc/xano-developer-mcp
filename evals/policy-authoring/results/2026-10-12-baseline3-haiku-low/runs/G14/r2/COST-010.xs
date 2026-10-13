policy "COST-010" {
  title = "AI calls and retries stay out of unbounded loops"
  statement = "An AI agent call must not run inside a loop, and a background task must not retry with a while loop, because a repeated call or retry can run up an unbounded cloud and AI bill. Batch work with a bounded query, or move the AI call into a function that is called once per request. A task that must retry uses a bounded counter and stops after a fixed number of attempts."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = { statements: ["ai.agent.run"], must_not_be_inside: ["foreach", "while"] }
  }

  rule {
    check = "stack.statement_forbidden"
    params = { statements: ["while"], object_kinds: ["task"] }
  }
}

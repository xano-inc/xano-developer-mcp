policy "COST-001" {
  title = "AI calls and retries stay out of unbounded loops"
  statement = "An AI agent run must not sit inside a loop, and an outbound request must not sit inside a while loop, because a loop can repeat the call without limit and drive up the cloud bill. Move the call out of the loop, or batch the work so each item is handled once. A loop that must retry is an exception only the policy owner can approve; bound it with a fixed attempt count before sending it for review."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    title = "AI agent runs are not inside a loop"
    check = "statement.containment"
    params = { statements: ["ai.agent.run"], must_not_be_inside: ["foreach", "for", "while"] }
  }

  rule {
    title = "Outbound requests are not retried inside a while loop"
    check = "statement.containment"
    params = { statements: ["api.request"], must_not_be_inside: ["while"] }
  }
}

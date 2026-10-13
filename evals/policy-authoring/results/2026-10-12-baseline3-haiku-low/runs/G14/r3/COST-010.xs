policy "COST-010" {
  title = "AI agent calls are not made inside loops"
  statement = "An AI agent run must not sit inside a foreach, for or while loop, because one loop can multiply the model bill without a limit. Batch the work, or move the call out of the loop with a stated item cap. An object that must loop over AI calls on purpose is the policy owner's decision: exempt it with the except_tags only after they approve."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost"]

  rule {
    check = "statement.containment"
    params = { statements: ["ai.agent.run"], must_not_be_inside: ["foreach", "for", "while"] }
  }
}

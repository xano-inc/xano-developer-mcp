policy "COST-010" {
  title = "AI calls and retries stay inside bounded work"
  statement = "No AI agent call sits inside a loop, because one loop can run the call thousands of times and run up the bill. No background task uses a while loop, because a while loop that retries can run forever. A task that must retry uses a bounded foreach over the items to retry, with an attempt limit written in the task. A task or call that truly needs a loop the rule does not allow is exempted by the policy owner, not by renaming it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["cost", "reliability"]

  rule {
    check = "statement.containment"
    params = {
      statements: ["ai.agent.run"],
      must_not_be_inside: ["foreach", "while"]
    }
  }

  rule {
    check = "stack.statement_forbidden"
    params = {
      statements: ["while"],
      object_kinds: ["task"]
    }
  }
}

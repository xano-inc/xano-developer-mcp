policy "COST-001" {
  title = "AI calls and background retries don't run in unbounded loops"
  statement = "No AI agent call may sit inside a foreach, for or while loop, where one bad run can bill once per item or per retry. No background task may loop with while, since a while retry can run forever. A call or retry that really needs a loop is exempted by the policy owner, not by a tag you add yourself."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {statements: ["ai.agent.run"], must_not_be_inside: ["foreach", "for", "while"]}
  }

  rule {
    check = "stack.statement_forbidden"
    params = {statements: ["while"], object_kinds: ["task"]}
  }
}

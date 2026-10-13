policy "TASK-001" {
  title = "Tasks have no while loops"
  statement = "Background tasks must not use while loops. An unbounded loop is how a task retries forever. This is a proxy: retry limits themselves are not checked."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["reliability"]

  rule {
    check = "stack.statement_forbidden"
    params = {statements: ["while"], object_kinds: ["task"]}
  }
}

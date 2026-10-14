policy "CONV-050" {
  title = "No leftover code"
  statement = "Stacks hold no disabled statements, declared inputs are read, and assigned variables are read."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.disabled_statement_forbidden"
    params = {}
  }

  rule {
    check = "object.unused_input_forbidden"
    params = {}
  }

  rule {
    check = "stack.unused_variable_forbidden"
    params = {}
  }
}

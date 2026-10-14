policy "CONV-050" {
  title = "No leftover code"
  statement = "Stacks hold no disabled statements, declared inputs are read, and assigned variables are read. Delete switched-off code rather than leaving it in place."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "stack.disabled_statement_forbidden"
  }

  rule {
    check = "object.unused_input_forbidden"
  }

  rule {
    check = "stack.unused_variable_forbidden"
  }
}

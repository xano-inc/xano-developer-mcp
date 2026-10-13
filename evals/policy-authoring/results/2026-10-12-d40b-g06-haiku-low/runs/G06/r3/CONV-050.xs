policy "CONV-050" {
  title = "No leftover code"
  statement = "Stacks hold no disabled statements, declared inputs are read, and assigned variables are read. Delete leftover code rather than switching it off; a disabled debug log the team switches on while debugging may stay only if its owner lists it."
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

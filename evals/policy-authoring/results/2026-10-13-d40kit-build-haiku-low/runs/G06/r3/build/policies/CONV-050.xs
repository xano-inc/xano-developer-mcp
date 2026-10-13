policy "CONV-050" {
  title = "No leftover code"
  statement = "No disabled statements, unused inputs or unread variables are left in an object. Delete the leftover code rather than switching it off."
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

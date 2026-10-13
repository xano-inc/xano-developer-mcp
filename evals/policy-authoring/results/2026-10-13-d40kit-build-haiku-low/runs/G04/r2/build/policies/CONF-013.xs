policy "CONF-013" {
  title = "Saved views hide health data fields"
  statement = "Every saved view of a table hides the fields marked sensitive in its schema, and password fields, so health data is not shown by default in table views."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
  }
}

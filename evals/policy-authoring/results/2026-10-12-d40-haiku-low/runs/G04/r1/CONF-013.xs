policy "CONF-013" {
  title = "Saved views hide sensitive fields"
  statement = "Every saved table view hides the fields marked sensitive in its table's schema, and password fields, so health data is not shown by default in the back office. Related to HIPAA minimum necessary access."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
  }
}

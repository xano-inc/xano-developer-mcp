policy "CONF-013" {
  title = "Saved views hide sensitive fields"
  statement = "Every saved view hides the fields marked sensitive in its table's schema, and password fields. Related to HIPAA minimum-necessary access to protected health information."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
    params = {}
  }
}

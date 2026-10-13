policy "CONF-013" {
  title = "Saved views hide sensitive fields"
  statement = "Every saved table view hides the fields marked sensitive in its table's schema, and password fields. Related to HIPAA minimum necessary for ePHI. Checks saved views only; a share link made with the default view is outside this rule."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
  }
}

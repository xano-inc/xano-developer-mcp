policy "CONF-013" {
  title = "Saved views hide sensitive fields"
  statement = "Every saved table view hides the fields marked sensitive in its table's schema, and password fields, so a saved view does not show patient identity or clinical data in plain view."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
  }
}

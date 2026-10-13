policy "CONF-013" {
  title = "Saved views hide sensitive fields"
  statement = "Every saved table view hides the fields marked sensitive, so health data is not shown by default in shared views. Related to HIPAA minimum necessary; a share link made with the default view shares every field and is outside this check."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
  }
}

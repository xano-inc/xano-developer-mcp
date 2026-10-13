policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "A table holding a health data field listed here carries the phi tag, so the access rules that depend on the tag apply to it. Related to HIPAA data classification for protected health information."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["ssn", "dob", "diagnosis", "note"], tag: "phi" }
  }
}

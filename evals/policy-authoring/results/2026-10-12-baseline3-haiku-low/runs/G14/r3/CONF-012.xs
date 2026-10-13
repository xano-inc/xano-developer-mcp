policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "Every table that stores a customer email address carries the pii tag, so the audit and access policies can find it. Tagging is the owner's decision, because tags decide which policies apply. A table whose email field has another name is not covered until its field name is added to field_names by the owner."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["email", "requester_email"], field_types: ["email"], tag: "pii" }
  }
}

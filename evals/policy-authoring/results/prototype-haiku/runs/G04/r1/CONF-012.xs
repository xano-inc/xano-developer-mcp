policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "Every table with a clinical free-text field (notes or diagnosis) carries the `confidential` tag."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["notes", "diagnosis"], tag: "confidential" }
  }
}

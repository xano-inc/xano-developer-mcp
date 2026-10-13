policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "Every table with a patient identifier or clinical field (ssn, insurance_member_id, diagnosis) carries the `phi` tag, so the data is classified and CONF-010 can find it."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = {
      field_names: ["ssn", "insurance_member_id", "diagnosis"]
      tag: "phi"
    }
  }
}

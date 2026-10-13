policy "CONF-012" {
  title = "Tables holding health data are tagged phi"
  statement = "Every table that declares a patient health field (diagnosis, ssn, dob, insurance_member_id) carries the phi tag, so the access rules that depend on it apply to that table."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["diagnosis", "ssn", "dob", "insurance_member_id"], tag: "phi" }
  }
}

policy "CONF-012" {
  title = "Tables holding health data are tagged"
  statement = "Every table with a field that holds health data (diagnosis, note, ssn, dob, insurance_member_id, reason) carries the phi tag, so the access and sensitivity rules can see it. Related to HIPAA safeguards for protected health information; a pass means only the stored definitions matched when it ran."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { tag: "phi", field_names: ["dob", "ssn", "insurance_member_id", "reason", "diagnosis", "note"] }
  }
}

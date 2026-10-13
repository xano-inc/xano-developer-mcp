policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "A patient, appointment or clinical note table with a field that holds confidential health data carries the `confidential` tag. Related to HIPAA data classification for ePHI."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["ssn", "insurance_member_id", "reason", "diagnosis", "note"], tag: "confidential", tables: ["patients", "appointments", "clinical_notes"] }
  }
}

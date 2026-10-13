policy "CONF-011" {
  title = "Patient health fields are marked sensitive"
  statement = "The patient health fields listed here (diagnosis, note, ssn, dob, insurance_member_id) are marked sensitive wherever the patients, clinical_notes and appointments tables declare them."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["diagnosis", "note", "ssn", "dob", "insurance_member_id"], attribute: "sensitive", tables: ["patients", "clinical_notes"] }
  }
}

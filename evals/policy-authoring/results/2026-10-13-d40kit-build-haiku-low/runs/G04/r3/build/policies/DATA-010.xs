policy "DATA-010" {
  title = "Endpoints don't return health data fields"
  statement = "Endpoints do not fetch the health-data fields (patients.ssn, patients.dob, patients.insurance_member_id, appointments.reason, clinical_notes.diagnosis, clinical_notes.note) out of their tables. Related to HIPAA minimum necessary; this checks what statements fetch, not the final response."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["patients.ssn", "patients.dob", "patients.insurance_member_id", "appointments.reason", "clinical_notes.diagnosis", "clinical_notes.note"], object_kinds: ["query"] }
  }
}

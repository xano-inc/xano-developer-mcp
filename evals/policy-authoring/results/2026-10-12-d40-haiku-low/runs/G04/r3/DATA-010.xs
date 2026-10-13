policy "DATA-010" {
  title = "Endpoints don't return patient identifiers or dates of birth"
  statement = "No endpoint fetches a patient's ssn, dob or insurance_member_id from the patients table, or any field marked sensitive. Clinicians' diagnosis notes are not covered by this rule; see the access rules for clinical notes."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["patients.ssn", "patients.dob", "patients.insurance_member_id"] }
  }
}

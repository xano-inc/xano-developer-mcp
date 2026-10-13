policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never fetch the listed health and identity fields, or any field marked sensitive in its table's schema. Related to HIPAA minimum necessary handling of protected health information. A clinician view that must show one of these fields is the policy owner's decision."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["ssn", "dob", "insurance_member_id", "diagnosis"] }
  }
}

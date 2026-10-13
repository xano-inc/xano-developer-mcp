policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints must not fetch the patient social security number or insurance member ID from the database. Clinician screens that need them must be reviewed by the platform owner first."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = {
      fields: ["ssn", "insurance_member_id"]
      object_kinds: ["query"]
    }
  }
}

policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never fetch the SSN, date of birth or insurance member ID, or any other field marked sensitive. Related to HIPAA minimum-necessary handling of protected health information."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = {fields: ["ssn", "dob", "insurance_member_id"], object_kinds: ["query"]}
  }
}

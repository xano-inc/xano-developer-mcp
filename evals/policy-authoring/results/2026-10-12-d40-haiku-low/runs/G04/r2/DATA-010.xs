policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never fetch the health-data fields ssn, dob, diagnosis or insurance_member_id, nor any field marked sensitive. A caller that needs one of them is the policy owner's decision."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["ssn", "dob", "diagnosis", "insurance_member_id"], object_kinds: ["query"] }
  }
}

policy "DATA-010" {
  title = "Endpoints don't return health data fields"
  statement = "Endpoints never fetch the health data fields ssn, dob, insurance_member_id or diagnosis, nor any field marked sensitive. An endpoint that needs one of them is a HIPAA exception for the policy owner to approve."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["ssn", "dob", "insurance_member_id", "diagnosis"], object_kinds: ["query"] }
  }
}

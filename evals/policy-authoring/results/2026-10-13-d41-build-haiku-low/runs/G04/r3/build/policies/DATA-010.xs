policy "DATA-010" {
  title = "Endpoints don't return health data"
  statement = "Endpoints never fetch the health fields you list, or any field marked sensitive in its table's schema."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = {fields: ["diagnosis", "note", "reason", "dob", "ssn", "insurance_member_id"], object_kinds: ["query"]}
  }
}

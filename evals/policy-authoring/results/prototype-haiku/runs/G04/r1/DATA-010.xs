policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoint queries never fetch the listed patient identifier fields or any field marked sensitive. An endpoint that needs one of them must be exempted by the policy owner, not changed by a fix."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { object_kinds: ["query"], fields: ["ssn", "date_of_birth"] }
  }
}

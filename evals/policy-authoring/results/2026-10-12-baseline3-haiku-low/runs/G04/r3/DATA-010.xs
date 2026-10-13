policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints never fetch the patient's SSN or insurance member ID from the patients table, or any field marked sensitive. Related to HIPAA minimum necessary for ePHI. An endpoint that must return one of these is exempted by the policy owner, not by its own tag."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["patients.ssn", "patients.insurance_member_id"], object_kinds: ["query"] }
  }
}

policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "Endpoints must not fetch patient identifiers that the clinician screens do not need: Social Security numbers and insurance member IDs (HIPAA minimum necessary, 45 CFR 164.502(b)). An endpoint that truly needs one of these fields is exempted by the policy owner, not by the endpoint author."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = { object_kinds: ["query"], fields: ["patients.ssn", "patients.insurance_member_id"] }
  }
}

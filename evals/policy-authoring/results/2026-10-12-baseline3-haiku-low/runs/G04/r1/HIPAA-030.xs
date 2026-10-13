policy "HIPAA-030" {
  title = "Patient reads don't fetch SSN or insurance IDs"
  statement = "Statements that read patients must not fetch the SSN or insurance member ID. Callers need the minimum necessary PHI; a flow that truly needs one of these fields is an exemption for the policy owner, not a silent change."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "164.502-b"]

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["patients.ssn", "patients.insurance_member_id"], tables: ["patients"] }
  }
}

policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "A table holding a diagnosis, clinical note, visit reason, date of birth, SSN or insurance member ID carries the phi tag. Related to HIPAA safeguards for protected health information. Tables that cannot carry the tag are reviewed by the policy owner."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = {field_names: ["diagnosis", "note", "reason", "dob", "ssn", "insurance_member_id"], tag: "phi"}
  }
}

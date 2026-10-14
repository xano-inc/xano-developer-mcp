policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The diagnosis, clinical note, visit reason, date of birth, SSN and insurance member ID fields are marked sensitive wherever their table declares them. Related to HIPAA safeguards for protected health information."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["diagnosis", "note", "reason", "dob", "ssn", "insurance_member_id"], attribute: "sensitive"}
  }
}

policy "CONF-011" {
  title = "Sensitive health fields are marked sensitive"
  statement = "The health-data fields (dob, ssn, insurance_member_id, reason, diagnosis, note) are marked sensitive wherever a table declares them. Related to HIPAA protected health information; a pass means only the stored definitions matched when it ran."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { attribute: "sensitive", field_names: ["dob", "ssn", "insurance_member_id", "reason", "diagnosis", "note"] }
  }
}

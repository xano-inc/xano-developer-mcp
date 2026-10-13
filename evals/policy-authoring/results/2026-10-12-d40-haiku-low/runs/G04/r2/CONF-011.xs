policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The health-data fields ssn, dob, diagnosis and insurance_member_id are marked sensitive wherever a table declares them."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "dob", "diagnosis", "insurance_member_id"], attribute: "sensitive" }
  }
}

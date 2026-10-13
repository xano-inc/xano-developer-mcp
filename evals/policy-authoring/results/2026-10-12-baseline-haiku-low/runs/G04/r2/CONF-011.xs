policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The patient identifiers and clinical fields (ssn, dob, insurance_member_id, diagnosis) must be marked sensitive wherever a table declares them."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = {
      field_names: ["ssn", "dob", "insurance_member_id", "diagnosis"]
      attribute: "sensitive"
    }
  }
}

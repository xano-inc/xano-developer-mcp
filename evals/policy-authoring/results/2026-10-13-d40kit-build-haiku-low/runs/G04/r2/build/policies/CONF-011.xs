policy "CONF-011" {
  title = "Health data fields are marked sensitive"
  statement = "The fields that hold health data, such as a diagnosis, date of birth, SSN or insurance member ID, are marked sensitive wherever a table declares them. A field that is removed or retyped loses data, so ask first."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "dob", "diagnosis", "insurance_member_id"], attribute: "sensitive" }
  }
}

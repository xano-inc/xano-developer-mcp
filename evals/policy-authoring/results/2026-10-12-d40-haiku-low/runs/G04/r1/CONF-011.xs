policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "Health data fields listed here are marked sensitive in their table schema wherever a table declares them, so they stay hidden from responses, saved views and other default outputs. Related to HIPAA safeguards for protected health information."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "dob", "diagnosis", "note", "insurance_member_id"], attribute: "sensitive" }
  }
}

policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The listed patient identifier fields are marked sensitive wherever a table declares them, so they are masked and kept out of saved views."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "date_of_birth"], attribute: "sensitive" }
  }
}

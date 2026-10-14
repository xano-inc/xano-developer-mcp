policy "CONF-011" {
  title = "Health fields are marked sensitive"
  statement = "The health fields you list, such as diagnosis, note, reason, dob, ssn and insurance_member_id, are marked sensitive wherever a table declares them."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["diagnosis", "note", "reason", "dob", "ssn", "insurance_member_id"], attribute: "sensitive"}
  }
}

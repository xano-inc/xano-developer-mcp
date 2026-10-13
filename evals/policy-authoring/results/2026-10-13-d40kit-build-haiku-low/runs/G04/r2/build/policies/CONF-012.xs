policy "CONF-012" {
  title = "Tables holding health data are tagged"
  statement = "A table with a field that holds health data, such as a diagnosis, date of birth, SSN or insurance member ID, carries the phi tag. Tag a table yourself only when it really holds that data."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["ssn", "dob", "diagnosis", "insurance_member_id"], tag: "phi" }
  }
}

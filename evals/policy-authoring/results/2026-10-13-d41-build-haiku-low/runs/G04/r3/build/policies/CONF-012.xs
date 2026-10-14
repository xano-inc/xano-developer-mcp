policy "CONF-012" {
  title = "Tables holding health data are tagged phi"
  statement = "A table with a health field you list, such as diagnosis, note, reason, dob, ssn or insurance_member_id, carries the phi tag. Tables holding health data and no other carry it."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = {field_names: ["diagnosis", "note", "reason", "dob", "ssn", "insurance_member_id"], tag: "phi"}
  }
}

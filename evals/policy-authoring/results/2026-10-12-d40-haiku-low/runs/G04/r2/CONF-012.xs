policy "CONF-012" {
  title = "Tables holding health data are tagged"
  statement = "Every table holding the health-data fields ssn, dob, diagnosis or insurance_member_id carries the phi tag. Until the tag exists on those tables, this policy reports them."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["ssn", "dob", "diagnosis", "insurance_member_id"], tag: "phi" }
  }
}

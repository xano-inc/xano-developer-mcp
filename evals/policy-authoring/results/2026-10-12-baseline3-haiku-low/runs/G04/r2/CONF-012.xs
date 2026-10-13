policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "HIPAA data inventory: every table that holds patient identifiers or clinical content carries the phi tag, so the tables that CONF-010 protects are the ones that are labelled."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = {
      field_names: ["ssn", "dob", "insurance_member_id", "diagnosis", "note"]
      include_sensitive: true
      tag: "phi"
      tables: ["patients", "clinical_notes"]
    }
  }
}

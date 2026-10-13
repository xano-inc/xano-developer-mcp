policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The patient identifiers and clinical text fields must be marked sensitive in their table schema, so that Xano hides them from saved views and the field checks apply (HIPAA safeguard for PHI, 45 CFR 164.312). Only the listed fields are checked; other personal fields need a policy change."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "dob", "insurance_member_id", "note", "diagnosis"], attribute: "sensitive", tables: ["patients", "clinical_notes"] }
  }
}

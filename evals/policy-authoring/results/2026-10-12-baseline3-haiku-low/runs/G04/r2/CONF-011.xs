policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "HIPAA data protection: the identifying and clinical fields of patients and clinical_notes are marked sensitive in the table schema, so the platform treats them as protected wherever they are declared."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = {
      attribute: "sensitive"
      field_names: ["ssn", "dob", "insurance_member_id", "phone", "email", "address", "diagnosis", "note"]
      tables: ["patients", "clinical_notes"]
    }
  }
}

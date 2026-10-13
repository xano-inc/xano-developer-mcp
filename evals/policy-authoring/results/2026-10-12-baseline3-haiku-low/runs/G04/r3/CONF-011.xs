policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The patient identifiers, contact details, clinical and appointment fields of the patients, appointments and clinical notes tables are marked sensitive in their schema. Related to HIPAA safeguards for ePHI. Only the fields listed here are checked; a personal-data field under another name is not found."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "dob", "insurance_member_id", "first_name", "last_name", "email", "phone", "address", "reason", "diagnosis", "note"], attribute: "sensitive", tables: ["patients", "appointments", "clinical_notes"] }
  }
}

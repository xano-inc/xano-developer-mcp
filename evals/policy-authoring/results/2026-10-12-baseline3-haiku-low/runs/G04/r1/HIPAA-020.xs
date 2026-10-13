policy "HIPAA-020" {
  title = "Patient identifiers and clinical text are marked sensitive"
  statement = "The fields that hold patient identifiers and clinical text on patients, appointments and clinical_notes must be marked sensitive, so that the platform treats them as protected data in views, outputs and checks."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "164.312-a-1"]

  rule {
    check = "table.field_attribute_required"
    params = { field_names: ["ssn", "dob", "insurance_member_id", "address", "phone", "diagnosis", "note"], attribute: "sensitive", value: true, tables: ["patients", "appointments", "clinical_notes"] }
  }
}

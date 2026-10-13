policy "CONF-011" {
  title = "Sensitive fields are marked sensitive"
  statement = "The patient identity, contact and clinical fields on patients and clinical_notes are marked sensitive in their table schema. A field that must stay unmarked needs its owner's decision, not a policy exemption."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.field_attribute_required"
    params = {field_names: ["first_name", "last_name", "dob", "ssn", "email", "phone", "address", "insurance_member_id", "diagnosis", "note"], attribute: "sensitive", tables: ["patients", "clinical_notes"]}
  }
}

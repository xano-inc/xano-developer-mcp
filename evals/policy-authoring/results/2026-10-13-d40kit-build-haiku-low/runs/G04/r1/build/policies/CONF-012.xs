policy "CONF-012" {
  title = "Tables holding confidential data are tagged"
  statement = "A table holding patient identity or clinical fields (first name, last name, date of birth, SSN, contact details, insurance member ID, diagnosis, note) carries the phi tag. Tables outside patients and clinical_notes are not judged by this rule."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = {tag: "phi", field_names: ["first_name", "last_name", "dob", "ssn", "email", "phone", "address", "insurance_member_id", "diagnosis", "note"], tables: ["patients", "clinical_notes"]}
  }
}

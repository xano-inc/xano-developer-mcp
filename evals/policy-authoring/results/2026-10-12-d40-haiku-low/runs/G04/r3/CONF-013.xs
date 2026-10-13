policy "CONF-013" {
  title = "Saved views of patient tables hide health fields"
  statement = "Every saved view of the patients and clinical_notes tables hides the health fields diagnosis, note, ssn, dob and insurance_member_id, as well as any field marked sensitive or password-typed."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.view_hide_required"
    params = { fields: ["diagnosis", "note", "ssn", "dob", "insurance_member_id"], tables: ["patients", "clinical_notes"] }
  }
}

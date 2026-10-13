policy "CONF-012" {
  title = "Tables holding PHI are tagged"
  statement = "Tables that hold protected health information (patient identifiers and clinical notes) must carry the `phi` tag, so that the access rules that follow the tag apply to them (HIPAA safeguard for PHI, 45 CFR 164.312). Tagging a table is the owner's decision."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "table.tag_required"
    params = { field_names: ["ssn", "dob", "insurance_member_id", "note", "diagnosis"], tag: "phi", tables: ["patients", "clinical_notes"] }
  }
}

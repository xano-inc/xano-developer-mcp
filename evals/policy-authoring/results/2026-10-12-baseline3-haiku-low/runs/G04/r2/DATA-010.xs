policy "DATA-010" {
  title = "Endpoints don't return personal data"
  statement = "HIPAA minimum necessary: endpoints do not fetch a patient's SSN or insurance member ID from the database. A screen that truly needs one must be approved by the platform owner, who decides any exemption."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "db.output_fields_forbidden"
    params = {
      fields: ["patients.ssn", "patients.insurance_member_id"]
      object_kinds: ["query"]
    }
  }
}

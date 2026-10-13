policy "HIPAA-040" {
  title = "PHI access is recorded in the audit log"
  statement = "Every endpoint that reads or writes patients, appointments or clinical_notes must always call record_audit_event, so that each access to protected health information leaves a row in audit_log."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "164.312-b"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", tables: ["patients", "appointments", "clinical_notes"] }
  }
}

policy "PHI-020" {
  title = "Changes to patient records call the audit function"
  statement = "Every endpoint that adds, edits, patches or deletes a row in the patients, clinical_notes or appointments tables calls the record_audit_event function unconditionally, so each change is recorded in the audit log."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["patients", "clinical_notes", "appointments"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["patients", "clinical_notes", "appointments"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["patients", "clinical_notes", "appointments"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["patients", "clinical_notes", "appointments"] } }
  }
}

policy "RET-001" {
  title = "Only the audit function writes the audit log"
  statement = "The audit log table must exist, and only the record_audit_event function may write to it. Audit entries are never edited or deleted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "audit"]

  rule {
    check = "workspace.object_required"
    params = {object_kind: "table", names: ["audit_log"]}
  }

  rule {
    check = "table.write_location_restricted"
    params = {restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"], statements: ["db.edit", "db.patch", "db.add_or_edit", "db.del", "db.truncate", "db.bulk.update", "db.bulk.patch", "db.bulk.delete"]}
  }
}

policy "AUDIT-001" {
  title = "Changes to customer email tables are audited"
  statement = "The audit_log table exists, and every object that adds, edits, patches or deletes rows in a table that stores customer emails calls record_audit_event, so each change records who changed what."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc7.2"]

  rule {
    check = "workspace.object_required"
    params = {object_kind: "table", names: ["audit_log"]}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "any", when: {statement: "db.add", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "any", when: {statement: "db.edit", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "any", when: {statement: "db.patch", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]}}
  }

  rule {
    check = "object.statement_required"
    params = {functions: ["record_audit_event"], placement: "any", when: {statement: "db.del", tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]}}
  }
}

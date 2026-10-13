policy "AUDIT-001" {
  title = "Changes to customer email tables are audited"
  statement = "Every create, edit, patch and delete of a table that stores customer emails calls the audit function record_audit_event, passing the logged-in user, so the audit log can answer who changed what. Audit entries are never edited or deleted. Writes made inside functions are not inspected by these rules, and the audit_log table must exist for the audit rules to judge anything."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["customers", "support_tickets", "newsletter_subscribers", "users", "patients", "orgs"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "support_tickets", "newsletter_subscribers", "users", "patients", "orgs"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "support_tickets", "newsletter_subscribers", "users", "patients", "orgs"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "support_tickets", "newsletter_subscribers", "users", "patients", "orgs"] } }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], statements: ["db.edit", "db.patch", "db.add_or_edit", "db.del", "db.truncate", "db.bulk.update", "db.bulk.patch", "db.bulk.delete"] }
  }
}

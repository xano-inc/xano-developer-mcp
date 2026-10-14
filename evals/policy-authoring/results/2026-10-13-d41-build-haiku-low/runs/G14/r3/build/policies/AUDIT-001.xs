policy "AUDIT-001" {
  title = "Changes to customer-email tables are recorded"
  statement = "Every add, edit, patch and delete of a table that stores customer emails (customers, newsletter_subscribers, users) calls record_audit_event, which writes an audit_log row with who made the change, which table and record, and the action. Only record_audit_event writes audit_log. Writes that run in a scheduled task or from a public endpoint record no actor. An object that cannot make the call is exempted by the policy owner, not by its author."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["audit_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["audit_log"], allowed_functions: ["record_audit_event"] }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["customers", "newsletter_subscribers", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "newsletter_subscribers", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "newsletter_subscribers", "users"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "newsletter_subscribers", "users"] } }
  }
}

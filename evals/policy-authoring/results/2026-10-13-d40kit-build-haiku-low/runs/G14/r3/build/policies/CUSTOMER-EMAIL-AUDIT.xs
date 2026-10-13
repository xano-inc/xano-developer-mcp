policy "CUSTOMER-EMAIL-AUDIT" {
  title = "Changes to customer email tables are audited"
  statement = "Every insert, update and delete of the customer contact tables (customers, users, newsletter_subscribers) calls the record_audit_event function right after the write, so who changed what is recorded in audit_log. A write that cannot audit must be reviewed by the policy owner before it is exempted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.add", tables: ["customers", "users", "newsletter_subscribers"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.patch", tables: ["customers", "users", "newsletter_subscribers"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.edit", tables: ["customers", "users", "newsletter_subscribers"] } }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["record_audit_event"], placement: "unconditional", when: { statement: "db.del", tables: ["customers", "users", "newsletter_subscribers"] } }
  }
}

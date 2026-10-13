policy "AUDIT-001" {
  title = "Changes to customer-email tables are audited"
  statement = "Every add, edit, patch and delete on a table that stores customer emails must call the record_audit_event function unconditionally, so each change is recorded with who made it. Tables covered: customers, users, newsletter_subscribers, patients, orgs and support_tickets. A table added later that stores emails must be added to these rules. An object that cannot audit its write must be fixed, not exempted, unless the policy owner decides otherwise."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = {
      functions: ["record_audit_event"]
      placement: "unconditional"
      when: {
        statement: "db.add"
        tables: ["customers", "users", "newsletter_subscribers", "patients", "orgs", "support_tickets"]
      }
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["record_audit_event"]
      placement: "unconditional"
      when: {
        statement: "db.edit"
        tables: ["customers", "users", "newsletter_subscribers", "patients", "orgs", "support_tickets"]
      }
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["record_audit_event"]
      placement: "unconditional"
      when: {
        statement: "db.patch"
        tables: ["customers", "users", "newsletter_subscribers", "patients", "orgs", "support_tickets"]
      }
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["record_audit_event"]
      placement: "unconditional"
      when: {
        statement: "db.del"
        tables: ["customers", "users", "newsletter_subscribers", "patients", "orgs", "support_tickets"]
      }
    }
  }
}

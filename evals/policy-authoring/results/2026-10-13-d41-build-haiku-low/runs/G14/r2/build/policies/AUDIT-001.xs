policy "AUDIT-001" {
  title = "Changes to customer-email tables are audited"
  statement = "Every add, edit, patch and delete of a table that stores customer emails calls the record_audit_event function, which is the only writer of the audit_log table, so the log can answer who changed what. Audit entries are never edited or deleted. Bulk writes are not judged by this policy, and functions that write are not inspected by the call rules."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "workspace.object_required"
    params = {
      object_kind: "table"
      names: ["audit_log"]
    }
  }

  rule {
    check = "table.write_location_restricted"
    params = {
      restricted_tables: ["audit_log"]
      allowed_functions: ["record_audit_event"]
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["record_audit_event"]
      placement: "unconditional"
      when: {
        statement: "db.add"
        tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]
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
        tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]
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
        tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]
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
        tables: ["customers", "users", "newsletter_subscribers", "support_tickets", "patients"]
      }
    }
  }
}

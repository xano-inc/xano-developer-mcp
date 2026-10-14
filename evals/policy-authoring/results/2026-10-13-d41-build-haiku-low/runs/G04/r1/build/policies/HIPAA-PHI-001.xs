policy "HIPAA-PHI-001" {
  title = "Health data is tagged, marked, login-only and logged"
  statement = "Tables holding health data are tagged phi and their health fields are marked sensitive. Only logged-in endpoints reach them. Every endpoint or task that reaches them records the access in phi_access_log through log_phi_access, the only writer of that table. Health fields stay out of responses and debug logs, and external requests verify TLS. A deliberate exception needs the policy owner's sign-off."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "phi"]

  rule {
    check = "table.tag_required"
    params = { tag: "phi", field_names: ["dob", "ssn", "insurance_member_id", "diagnosis", "first_name", "last_name", "address"] }
  }

  rule {
    check = "table.field_attribute_required"
    params = { attribute: "sensitive", field_names: ["dob", "ssn", "insurance_member_id", "diagnosis", "first_name", "last_name", "address"] }
  }

  rule {
    check = "object.tagged_table_access"
    params = { table_tags: ["phi"] }
  }

  rule {
    check = "db.output_fields_forbidden"
    params = { fields: ["ssn", "dob", "insurance_member_id", "diagnosis", "note"], table_tags: ["phi"], object_kinds: ["query"] }
  }

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input", "$auth", "$env"] }
  }

  rule {
    check = "table.view_hide_required"
  }

  rule {
    check = "statement.param_forbidden"
    params = { statements: ["api.request", "stream.from_request"], param_names: ["verify_peer", "verify_host"], values: [false] }
  }

  rule {
    check = "workspace.object_required"
    params = { object_kind: "table", names: ["phi_access_log"] }
  }

  rule {
    check = "table.write_location_restricted"
    params = { restricted_tables: ["phi_access_log"], allowed_functions: ["log_phi_access"] }
  }

  rule {
    check = "object.statement_required"
    params = { functions: ["log_phi_access"], placement: "unconditional", reaching_table_tags: ["phi"] }
  }
}

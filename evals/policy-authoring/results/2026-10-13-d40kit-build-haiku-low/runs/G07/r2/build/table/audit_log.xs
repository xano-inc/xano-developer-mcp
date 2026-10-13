// Audit trail: one row per edit or delete of an audited table, written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id? {
      table = "users"
    }

    text action
    text table_name
    int record_id
    text detail?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}

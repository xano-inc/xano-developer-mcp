// One row per edit, patch or delete of an audited table: who made it, which table and record, the action and when. Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id? {
      table = "users"
    }

    text table_name
    int record_id
    enum action {
      values = ["edit", "patch", "delete"]
    }
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}

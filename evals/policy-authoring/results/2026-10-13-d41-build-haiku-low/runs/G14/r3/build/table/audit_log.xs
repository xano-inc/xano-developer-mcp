// One row per add, edit, patch or delete of a customer-email table: who made it, which table and record, and what happened.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id?
    text table_name
    int record_id
    enum action {
      values = ["add", "edit", "patch", "delete"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "table_name", op: "asc"}, {name: "record_id", op: "asc"}]}
  ]
}

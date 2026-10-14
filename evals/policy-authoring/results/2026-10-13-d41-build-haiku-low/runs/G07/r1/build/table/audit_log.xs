// One row per change to a sensitive table: who made it, which table and record, what action and when. Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id?
    text table_name
    int record_id?
    text action
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "table_name", op: "asc"}]}
  ]
}

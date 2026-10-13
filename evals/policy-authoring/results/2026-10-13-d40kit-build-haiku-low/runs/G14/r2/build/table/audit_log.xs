// Append-only record of who changed which row of a table holding customer emails.
// Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text table_name
    int record_id?
    text action
    int actor_id?
    json changes?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "table_name", op: "asc"}, {name: "record_id", op: "asc"}]}
  ]
}

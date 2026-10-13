// Who changed what: one row per change to customer data. Written by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id?
    text action
    text table_name
    int record_id?
    json changes?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  guid = "P9ETkfzBfZSwW3aSXDyE1JJUhiY"
}
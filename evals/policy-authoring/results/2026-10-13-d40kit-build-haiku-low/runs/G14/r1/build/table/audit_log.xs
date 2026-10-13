// Append-only record of who changed customer email data. Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_user_id?
    text table_name
    int record_id?
    text action
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}

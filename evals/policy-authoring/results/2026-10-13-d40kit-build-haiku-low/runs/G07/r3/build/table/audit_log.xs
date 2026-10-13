// Append-only record of each change to a customer or user record: who made it, what they did, which record, and when. Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id? {
      table = "users"
    }

    text action filters=trim
    text table_name filters=trim
    int record_id
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "record_id", op: "asc"}]}
  ]
}

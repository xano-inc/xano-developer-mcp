// One row per change to a table that stores customer emails: who made it, which table and record, what was done, and when.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text table_name
    int record_id
    text action
    int actor_id?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}

// Append-only record of changes to customer data: who changed which record, what changed, and when.
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

// One row per change to a customer-email record: who changed it, which record, and what happened.
table email_change_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int actor_id?
    text table_name
    int record_id
    text action
    text note?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
  guid = "eCL7mQ2xVb9tRw4kHs1pYzN8aFe"
}

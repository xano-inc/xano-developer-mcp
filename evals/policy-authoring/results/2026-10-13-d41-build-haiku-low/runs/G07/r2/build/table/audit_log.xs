// One row per edit or delete of a business record: who made it, which table and record, the action and when. Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id? {
      table = "users"
    }

    text table_name
    int record_id
    text action
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}

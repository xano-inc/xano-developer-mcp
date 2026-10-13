// Append-only record of changes to sensitive data. Written only by record_audit_event.
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now

    // The logged-in user who made the change.
    int actor_id? {
      table = "users"
    }

    // What happened, such as refund.approve.
    text action

    // The table whose row changed, and that row's id.
    text target_table
    int target_id?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}

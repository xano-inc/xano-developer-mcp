// Writes one audit_log entry recording who changed which record, in which table, and how. Call it straight after every edit or delete of customers or users.
function record_audit_event {
  input {
    int actor_id?
    text action
    text table_name
    int record_id
  }

  stack {
    db.add audit_log {
      data = {
        actor_id: $input.actor_id
        action: $input.action
        table_name: $input.table_name
        record_id: $input.record_id
      }
    } as $entry
  }

  response = $entry
}

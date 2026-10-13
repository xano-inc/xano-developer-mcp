// Writes one audit entry. Called for each edit, patch and delete of a customer-email table.
function record_audit_event {
  input {
    int actor_user_id?
    text table_name
    int record_id?
    text action
  }

  stack {
    db.add audit_log {
      data = {
        actor_user_id: $input.actor_user_id
        table_name   : $input.table_name
        record_id    : $input.record_id
        action       : $input.action
      }
    } as $entry
  }

  response = $entry
}

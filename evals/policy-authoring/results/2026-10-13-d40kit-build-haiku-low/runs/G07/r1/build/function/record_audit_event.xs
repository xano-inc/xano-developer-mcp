// Writes one row to the audit log. The only function allowed to write to it.
function record_audit_event {
  input {
    int actor_id?

    // The action taken, such as refund.approve.
    text action

    // The table whose row changed, and that row's id.
    text target_table
    int target_id?
  }

  stack {
    db.add audit_log {
      data = {
        actor_id    : $input.actor_id
        action      : $input.action
        target_table: $input.target_table
        target_id   : $input.target_id
      }
    } as $entry
  }

  response = $entry
}

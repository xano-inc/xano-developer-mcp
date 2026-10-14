// Adds one audit_log row for a change to an audited table, recording the signed-in user. The only function that writes the audit log.
function record_audit_event {
  input {
    text table_name
    int record_id
    text action
  }

  stack {
    db.add audit_log {
      data = {
        actor_id  : $auth.id
        table_name: $input.table_name
        record_id : $input.record_id
        action    : $input.action
      }
    } as $entry
  }

  response = $entry
}

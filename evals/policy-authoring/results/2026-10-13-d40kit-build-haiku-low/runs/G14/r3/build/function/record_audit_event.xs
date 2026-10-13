// Writes one audit_log row. The only code that writes the audit log.
function record_audit_event {
  input {
    text table_name
    int record_id
    text action
    int? actor_id
  }

  stack {
    db.add audit_log {
      data = {
        table_name: $input.table_name
        record_id : $input.record_id
        action    : $input.action
        actor_id  : $input.actor_id
      }
    } as $entry
  }

  response = $entry
}

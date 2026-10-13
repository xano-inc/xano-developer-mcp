// Writes one audit_log entry. The only code that writes to audit_log; called after each change to an audited table.
function record_audit_event {
  input {
    int actor_id?
    text action
    text table_name
    int record_id
    text detail?
  }

  stack {
    db.add audit_log {
      data = {
        actor_id: $input.actor_id,
        action: $input.action,
        table_name: $input.table_name,
        record_id: $input.record_id,
        detail: $input.detail
      }
    } as $entry
  }

  response = $entry
  guid = "rec_audit_event_g07"
}

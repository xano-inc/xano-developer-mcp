// Writes one audit_log entry. The only object allowed to write audit_log.
function record_audit_event {
  input {
    text table_name
    int record_id?
    text action
    int actor_id?
    json changes?
  }

  stack {
    db.add audit_log {
      data = {
        table_name: $input.table_name
        record_id : $input.record_id
        action    : $input.action
        actor_id  : $input.actor_id
        changes   : $input.changes
      }
    } as $entry
  }

  response = $entry
}

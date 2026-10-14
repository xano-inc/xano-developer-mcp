// Adds one audit_log row recording a change: the user who made it, the table, the record and the action. Called by every endpoint and function that edits, patches or deletes a sensitive table.
function record_audit_event {
  input {
    int actor_id?
    text table_name
    int record_id?
    text action
  }

  stack {
    db.add audit_log {
      data = {
        actor_id  : $input.actor_id
        table_name: $input.table_name
        record_id : $input.record_id
        action    : $input.action
      }
    } as $entry
  }

  response = $entry
}

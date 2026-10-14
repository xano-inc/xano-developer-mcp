// Adds one audit_log row for an edit or delete. The only function that writes audit_log.
function record_audit_event {
  input {
    int user_id
    text table_name
    int record_id
    text action
  }

  stack {
    db.add audit_log {
      data = {
        user_id    : $input.user_id
        table_name : $input.table_name
        record_id  : $input.record_id
        action     : $input.action
      }
    } as $entry
  }

  response = $entry
}

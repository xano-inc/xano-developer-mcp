// Writes one phi_access_log row for a read or write of health data. Called by every object that reaches a phi table.
function log_phi_access {
  input {
    int user_id
    text resource
    int record_id?
  }

  stack {
    db.add phi_access_log {
      data = {
        user_id  : $input.user_id
        resource : $input.resource
        record_id: $input.record_id
      }
    } as $entry
  }

  response = $entry
}

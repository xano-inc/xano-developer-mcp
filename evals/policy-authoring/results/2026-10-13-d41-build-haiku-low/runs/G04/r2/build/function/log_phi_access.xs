// Records that the logged-in user accessed a health record. Every endpoint that reaches a phi table calls it.
function log_phi_access {
  input {
    text table_name
    int record_id?
  }

  stack {
    db.add phi_access_log {
      data = {
        user_id    : $auth.id
        table_name : $input.table_name
        record_id  : $input.record_id
        accessed_at: now
      }
    } as $entry
  }

  response = $entry
}

// Records one read of a health record in phi_access_log for the logged-in user.
function log_phi_access {
  input {
    text record_table
    int record_id
  }

  stack {
    db.add phi_access_log {
      data = {
        user_id     : $auth.id
        record_table: $input.record_table
        record_id   : $input.record_id
      }
    } as $access
  }

  response = $access
}

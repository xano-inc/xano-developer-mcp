// Records that a user accessed a patient record, so every PHI read or write leaves a trace.
function log_phi_access {
  input {
    int user_id
    text resource
    int resource_id?
  }

  stack {
    db.add phi_access_log {
      data = {
        user_id    : $input.user_id
        resource   : $input.resource
        resource_id: $input.resource_id
      }
    } as $entry
  }

  response = $entry
}

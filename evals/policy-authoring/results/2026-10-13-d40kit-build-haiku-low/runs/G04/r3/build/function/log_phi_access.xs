// Records that a logged-in user opened or changed one patient's health data. Called by endpoints that reach phi tables.
function log_phi_access {
  input {
    int user_id
    int patient_id
    text action
  }

  stack {
    db.add phi_access_log {
      data = {
        user_id   : $input.user_id
        patient_id: $input.patient_id
        action    : $input.action
      }
    } as $entry
  }

  response = $entry
}

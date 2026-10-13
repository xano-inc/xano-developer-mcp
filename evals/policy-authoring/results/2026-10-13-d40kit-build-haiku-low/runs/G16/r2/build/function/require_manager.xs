// Stops the call unless the given user has the manager role. Callers pass the logged-in user's id.
function require_manager {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user.role == "manager") {
      error_type = "accessdenied"
      error = "Only managers can do this."
    }
  }

  response = {ok: true}
}

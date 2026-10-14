// Stops the call unless the user is a manager. Reads the role from the users table, never from the token.
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

  response = true
}

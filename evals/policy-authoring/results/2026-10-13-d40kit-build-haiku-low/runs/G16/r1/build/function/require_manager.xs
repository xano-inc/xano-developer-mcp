// Stops the request unless the user is a manager or an admin. Call it as the first statement of any endpoint that approves refunds or changes prices.
function require_manager {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user.role == "manager" || $user.role == "admin") {
      error_type = "accessdenied"
      error = "Only managers can do this."
    }
  }

  response = {allowed: true}
}

// Stops the call unless the user is a manager. Called first by endpoints that approve refunds or change prices.
function require_manager {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $me

    precondition ($me.role == "manager") {
      error_type = "accessdenied"
      error = "Only managers can do this."
    }
  }

  response = {manager: true}
}

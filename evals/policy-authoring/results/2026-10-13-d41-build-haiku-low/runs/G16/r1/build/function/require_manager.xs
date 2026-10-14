// Stops the call unless the given user is a manager or admin. Called first by refund approval and price changes.
function require_manager {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $me

    precondition ($me.role == "manager" || $me.role == "admin") {
      error_type = "accessdenied"
      error = "Only managers can do this."
    }
  }

  response = {allowed: true}
}

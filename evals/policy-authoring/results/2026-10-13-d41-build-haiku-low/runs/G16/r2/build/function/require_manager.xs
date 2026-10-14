// Stops the call unless the logged-in user is a manager (or an admin). Call it first in any endpoint that approves refunds or changes prices.
function require_manager {
  input {
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $auth.id
    } as $me

    precondition ($me.role == "manager" || $me.role == "admin") {
      error_type = "accessdenied"
      error = "Only managers can do this."
    }
  }

  response = $me
}

// Stops the request unless the user is an admin or a support lead. Reads the role from the database, not the login token.
function require_admin_role {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user.role == "admin" || $user.role == "support_lead") {
      error_type = "accessdenied"
      error = "Admin or support lead role required."
    }
  }

  response = $user.role
}

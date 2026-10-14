// Stops the caller unless their role is admin or support_lead. Called first by every /admin endpoint.
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
      error = "You need the admin or support_lead role."
    }
  }

  response = {role: $user.role}
}

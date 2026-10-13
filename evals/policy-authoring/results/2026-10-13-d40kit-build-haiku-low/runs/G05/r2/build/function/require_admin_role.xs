// Stops the request unless the logged-in user's role is admin or support_lead. Admin endpoints call it first.
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

  response = {allowed: true}
  guid = "Rk2mV8hT4pQw1cXz6LnYbA9sEdU"
}

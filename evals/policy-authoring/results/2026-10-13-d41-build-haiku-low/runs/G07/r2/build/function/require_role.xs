// Stops the request unless the user is an admin. Admin endpoints call it first.
function require_role {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user.role == "admin") {
      error_type = "accessdenied"
      error = "Admins only."
    }
  }

  response = $user
}

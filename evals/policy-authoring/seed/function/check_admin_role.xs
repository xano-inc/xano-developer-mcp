// Stops the request unless the signed-in user is an admin or a support lead. Admin endpoints call it first.
function check_admin_role {
  input {
    int user_id
  }

  stack {
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user
  
    precondition ($user != null && ($user.role == "admin" || $user.role == "support_lead")) {
      error_type = "accessdenied"
      error = "Admins and support leads only."
    }
  }

  response = $user
  guid = "9-ofyr08z3NirZ2qtVtXGXN351k"
}
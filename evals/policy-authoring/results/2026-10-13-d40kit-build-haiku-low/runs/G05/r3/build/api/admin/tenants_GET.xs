// Tenants of one org, for support staff.
query tenants verb=GET {
  api_group = "admin"
  auth = "users"

  input {
    int org_id
  }

  stack {
    function.run require_admin_role {
      input = {user_id: $auth.id}
    } as $role_check

    db.query tenants {
      where = $db.tenants.org_id == $input.org_id
      return = {type: "list"}
    } as $tenants
  }

  response = $tenants
  tags = ["admin"]
  guid = "4nJQd3BQCPRKwDnGh4J1BAAuBfo"
}
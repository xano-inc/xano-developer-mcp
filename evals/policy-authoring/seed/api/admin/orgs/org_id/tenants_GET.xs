// The tenants that belong to one org.
query "orgs/{org_id}/tenants" verb=GET {
  api_group = "admin"
  auth = "users"

  input {
    int org_id
  }

  stack {
    function.run check_admin_role {
      input = {user_id: $auth.id}
    } as $staff
  
    db.query tenants {
      where = $db.tenants.org_id == $input.org_id
      return = {type: "list"}
    } as $tenants
  }

  response = $tenants
  guid = "kC39ZPgrjdXHBHL2WIrtAJOPl0U"
}
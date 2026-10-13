// Changes a tenant's status or region.
query "tenants/{tenant_id}" verb=PATCH {
  api_group = "admin"
  auth = "users"

  input {
    int tenant_id
    int org_id
    text status?
    text region?
  }

  stack {
    function.run require_admin_role {
      input = {role: $auth.role}
    } as $role_check

    db.query tenants {
      where = $db.tenants.id == $input.tenant_id && $db.tenants.org_id == $input.org_id
      return = {type: "single"}
    } as $before

    db.edit tenants {
      field_name = "id"
      field_value = $before.id
      data = {status: $input.status, region: $input.region}
    } as $tenant
  }

  response = $tenant
  guid = "q_GTR5U7b2fchb6y6QVrfJuh4mo"
}
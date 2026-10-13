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
    db.get tenants {
      field_name = "id"
      field_value = $input.tenant_id
    } as $before
  
    db.edit tenants {
      field_name = "id"
      field_value = $input.tenant_id
      data = {status: $input.status, region: $input.region}
    } as $tenant

    function.run record_audit_event {
      input = {
        actor_id: $auth.id,
        action: "update",
        table_name: "tenants",
        record_id: $input.tenant_id
      }
    } as $audit
  }

  response = $tenant
  guid = "q_GTR5U7b2fchb6y6QVrfJuh4mo"
}
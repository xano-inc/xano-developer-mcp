// Usage numbers for the staff dashboard. Lives in the app API under admin/ for historical reasons.
query "admin/stats" verb=GET {
  api_group = "app"
  auth = "users"

  input {
  }

  stack {
    function.run require_role {
      input = {user_id: $auth.id, role: "admin"}
    } as $role_check

    db.query tenants {
      return = {type: "count"}
    } as $tenant_count
  
    db.query users {
      return = {type: "count"}
    } as $user_count
  }

  response = {tenants: $tenant_count, users: $user_count}
  guid = "Ht7y0W-CD8I3INuKKz9HxJvNK6Q"
}
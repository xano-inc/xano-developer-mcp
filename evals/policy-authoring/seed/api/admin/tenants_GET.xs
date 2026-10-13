// Tenants of one org, for support staff.
query tenants verb=GET {
  api_group = "admin"
  auth = "users"

  input {
    int org_id
  }

  stack {
    db.query tenants {
      return = {type: "list"}
    } as $tenants
  }

  response = $tenants
  guid = "4nJQd3BQCPRKwDnGh4J1BAAuBfo"
}
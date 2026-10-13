policy "AUTH-021" {
  title = "Admin endpoints filter tenants by org"
  statement = "Every admin endpoint that reads or writes the tenants table must filter that access on org_id, so a request can only reach tenants of one org. A read or write that picks a tenant by id alone is reported; add an org_id predicate that the row must match."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = {
      field: "org_id"
      table_selector: {names: ["tenants"]}
      api_groups: ["admin"]
      object_kinds: ["query"]
    }
  }
}

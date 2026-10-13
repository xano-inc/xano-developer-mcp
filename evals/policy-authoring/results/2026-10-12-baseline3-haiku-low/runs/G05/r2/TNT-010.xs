policy "TNT-010" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table must filter on org_id, so no request reaches tenants of other orgs. Queries that intentionally span all orgs need the policy owner's exemption, not a change to this rule."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = {table_selector: {names: ["tenants"]}, field: "org_id"}
  }
}

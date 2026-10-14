policy "TENANT-010" {
  title = "Tenants table is always filtered by org_id"
  statement = "Every read and write of the tenants table must filter on org_id. A query that reads or changes tenants without an org_id condition is a finding; scope the query to the caller's org to clear it."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = {field: "org_id", table_selector: {names: ["tenants"]}}
  }
}

policy "AUTH-020" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table filters on org_id, so no request reaches tenant rows across orgs without an org_id filter."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "db.where_constraint_required"
    params = { field: "org_id", table_selector: { names: ["tenants"] } }
  }
}

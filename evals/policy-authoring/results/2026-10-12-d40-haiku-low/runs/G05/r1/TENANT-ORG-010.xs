policy "TENANT-ORG-010" {
  title = "Tenant reads and writes filter by org"
  statement = "Every read and write of the tenants table filters on org_id, so no query reaches tenants across organisations. Reads and writes by id alone must add the org_id filter."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = { field: "org_id", table_selector: { names: ["tenants"] } }
  }
}

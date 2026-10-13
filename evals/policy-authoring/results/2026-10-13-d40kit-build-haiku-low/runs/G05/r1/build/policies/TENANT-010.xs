policy "TENANT-010" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table must filter on org_id, so one org's tenants are never read or changed without naming the org."
  severity = "critical"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = {
      field: "org_id"
      table_selector: {names: ["tenants"]}
    }
  }
}

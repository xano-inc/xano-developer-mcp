policy "TENANT-010" {
  title = "Tenant rows are read and written only within an org"
  statement = "Every read and write of the tenants table must filter on org_id, so no statement touches a tenant row without naming its org. The policy checks that an org_id filter is present, not that it matches the caller's own org."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2"]

  rule {
    check = "db.where_constraint_required"
    params = {
      field: "org_id",
      table_selector: {names: ["tenants"]}
    }
  }
}

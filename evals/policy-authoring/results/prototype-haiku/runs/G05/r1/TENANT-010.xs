policy "TENANT-010" {
  title = "Tenant queries filter by org_id"
  statement = "Every read and write of the tenants table filters on org_id, so no query returns or changes tenants outside the filter. The rule reads each endpoint's and function's own statements; a helper function that reads tenants by a passed-in id is reported on that function. Advisory: a finding flags the object and blocks nothing."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = { table_selector: { names: ["tenants"] }, field: "org_id" }
  }
}

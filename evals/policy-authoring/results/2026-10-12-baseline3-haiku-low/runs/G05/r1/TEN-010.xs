policy "TEN-010" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table filters on org_id, so no statement reaches tenants of another org. A write that picks its row by id alone, or a helper function that writes by an id passed in, is reported and must be moved behind an org_id-constrained read or exempted by the policy owner."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = { table_selector: { names: ["tenants"] }, field: "org_id" }
  }
}

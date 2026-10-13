policy "ADMIN-020" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table filters on org_id, so no endpoint or function reaches tenants without an org filter. A call that must reach tenants across every org needs the policy owner's decision before any exemption."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = { field: "org_id", table_selector: { names: ["tenants"] } }
  }
}

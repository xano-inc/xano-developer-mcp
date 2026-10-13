policy "TEN-010" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table must filter on org_id, so a tenant row is only reached through its own organisation. Every object that touches tenants is checked, admin or not. An object that cannot filter by org_id is not exempted by its author; the platform owner decides any exemption."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "db.where_constraint_required"
    params = {
      table_selector: {names: ["tenants"]},
      field: "org_id"
    }
  }
}

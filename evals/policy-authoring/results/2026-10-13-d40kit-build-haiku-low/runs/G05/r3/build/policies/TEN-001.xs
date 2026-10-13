policy "TEN-001" {
  title = "Tenant reads and writes filter on org_id"
  statement = "Nothing reads or writes the tenants table without constraining org_id, so one org never reaches another org's tenants. A query that must span orgs needs an exemption decided by the policy owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2"]

  rule {
    check = "db.where_constraint_required"
    params = {field: "org_id", table_selector: {names: ["tenants"]}}
  }
}

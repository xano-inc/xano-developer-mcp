policy "ADMIN-TENANT-ORG" {
  title = "Tenant reads and writes filter on org_id"
  statement = "Every read and write of the tenants table filters on org_id, so no query reaches tenant rows without choosing an org. Related to SOC 2 CC6.1 tenant isolation. Checks that an org_id filter is written, not which value it is given."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "db.where_constraint_required"
    params = {
      field: "org_id"
      table_selector: {names: ["tenants"]}
      tables: ["tenants"]
    }
  }
}

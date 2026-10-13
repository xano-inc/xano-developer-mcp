policy "TENANT-010" {
  title = "Tenant reads and writes filter by org_id"
  statement = "Every read and write of the tenants table must constrain org_id in its where clause, so that a request only touches tenants belonging to one org. A row picked by id alone is not allowed. A statement that cannot filter by org_id is not exempt: change it to filter by org_id first."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    title = "tenants reads and writes constrain org_id"
    check = "db.where_constraint_required"
    params = {
      table_selector: {names: ["tenants"]},
      field: "org_id"
    }
  }
}

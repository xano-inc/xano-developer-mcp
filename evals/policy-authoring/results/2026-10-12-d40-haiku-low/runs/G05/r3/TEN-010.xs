policy "TEN-010" {
  title = "Tenant reads and writes filter on org_id"
  statement = "Every read and write of the tenants table filters on org_id, so no statement reaches tenants across orgs without naming the org. Write the org_id predicate in the statement itself, on the tenants table, not in a called function. Use the org the request names, and do not drop the filter to fetch a tenant by id: fetch it with org_id as well."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "db.where_constraint_required"
    params = {
      field: "org_id",
      table_selector: {names: ["tenants"]}
    }
  }
}

policy "RET-003" {
  title = "Retained data is deleted after a set number of days"
  statement = "Tables tagged retained are deleted after a set number of days. Each must be reached by an active scheduled task that deletes its rows once created_at is older than 730 days. A table that cannot follow this rule is exempted by its owner, never by the author."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "soc2"]

  rule {
    check = "table.coverage_required"
    params = { tags: ["retained"], referenced_by: { object_kinds: ["task"], max_age_days: 730 } }
  }
}

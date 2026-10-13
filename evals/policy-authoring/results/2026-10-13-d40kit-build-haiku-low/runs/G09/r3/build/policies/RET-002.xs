policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table carrying your retained-data tag is referenced by a scheduled task that cleans it up."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "gdpr"]

  rule {
    check = "table.coverage_required"
    params = { tags: ["retained"], referenced_by: { object_kinds: ["task"], statements: ["db.del", "db.bulk.delete"] } }
  }
}

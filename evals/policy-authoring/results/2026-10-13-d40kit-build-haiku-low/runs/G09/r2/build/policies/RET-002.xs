policy "RET-002" {
  title = "Retained data has a cleanup task"
  statement = "Every table tagged retained is deleted from by a scheduled task, so its rows are removed on a schedule. The task holds the retention period in its own query; no check reads the age of the rows it deletes. A table that must be kept longer is not tagged retained, and that choice belongs to its owner."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "gdpr"]

  rule {
    check = "table.coverage_required"
    params = {tags: ["retained"], referenced_by: {object_kinds: ["task"], statements: ["db.del", "db.bulk.delete"]}}
  }
}

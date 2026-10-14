policy "ERASE-001" {
  title = "Account deletion erases personal data everywhere"
  statement = "Every table tagged personal must be reached by the erasure function, the one function tagged erasure, which deletes a person's rows with db.del or db.bulk.delete. Endpoints that reach the deletion path require login. A table that cannot be erased is exempted by its owner, never by the author."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = { tags: ["personal"], referenced_by: { object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"] } }
  }

  rule {
    check = "object.auth_required"
    params = { object_kinds: ["query"], paths: ["account"] }
  }
}

policy "GDPR-ERASE" {
  title = "Account deletion erases personal data"
  statement = "Every table carrying the personal tag is deleted from by the erasure function, which runs when a user deletes their account. Orders are detached, not deleted, and are not covered by this rule."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["personal"],
      referenced_by: {
        object_kinds: ["function"],
        tags: ["erasure"],
        statements: ["db.del", "db.bulk.delete"]
      }
    }
  }
}

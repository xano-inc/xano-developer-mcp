policy "ERASE-001" {
  title = "Account deletion erases personal data"
  statement = "Every table tagged personal is reached by the erasure function, which deletes or anonymises a person's rows when their account is deleted. The erasure function carries the erasure tag. Tables that keep records for legal retention are anonymised, not deleted, and that choice belongs to the policy owner. This policy cannot see whether a row is personal in fact, only whether its table is tagged."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = {tags: ["personal"], referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"]}}
  }
}

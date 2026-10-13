policy "GDPR-ERASE-001" {
  title = "Account deletion erases personal data everywhere"
  statement = "Every table tagged personal is erased by the account-erasure function, tagged erasure, when a user deletes their account. Records that must be kept for business or legal reasons are anonymised by that function rather than left linked to the person; a table outside this rule needs its own review."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = { tags: ["personal"], referenced_by: { object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"] } }
  }
}

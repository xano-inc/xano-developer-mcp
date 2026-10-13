policy "GDPR-ERASURE" {
  title = "Account deletion erases personal data everywhere"
  statement = "Every table carrying the personal-data tag is deleted from by the one erasure function, the function tagged erasure that a user's account deletion calls. A table left out of that function keeps a person's data after they delete their account. Anonymised rather than deleted tables are not covered by this rule: they need db.edit or db.patch added to the function's statements to be judged."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["personal"]
      referenced_by: {
        object_kinds: ["function"]
        tags: ["erasure"]
        statements: ["db.del", "db.bulk.delete"]
      }
    }
  }
}

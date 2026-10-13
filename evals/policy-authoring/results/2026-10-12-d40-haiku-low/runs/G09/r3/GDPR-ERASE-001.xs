policy "GDPR-ERASE-001" {
  title = "Account deletion erases every table linked to the user"
  statement = "When a user deletes their account, the erasure function deletes their rows from every table that links to users. The erasure function must carry the erasure tag. A table whose rows must be kept after deletion needs a documented exemption from the policy owner, not a change to this rule."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "table.coverage_required"
    params = {
      table_selector: {has_fk_to: "users"}
      referenced_by: {
        object_kinds: ["function"]
        tags: ["erasure"]
        statements: ["db.del", "db.bulk.delete"]
      }
    }
  }
}

policy "GDPR-010" {
  title = "Account deletion removes all personal data"
  statement = "When a user deletes their account, every table that holds personal data must be cleaned by the account-deletion function, and the account-deletion endpoint must call that function. Data that cannot be deleted for a legal reason must be listed as an exemption with the platform owner's sign-off."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr", "gdpr-art17"]

  rule {
    check = "table.coverage_required"
    params = {
      tags: ["personal-data"],
      referenced_by: {
        object_kinds: ["function"],
        tags: ["account-deletion"],
        statements: ["db.del", "db.bulk.delete"]
      }
    }
  }

  rule {
    check = "object.statement_required"
    params = {
      functions: ["delete_account_data"],
      placement: "unconditional",
      tags: ["account-deletion"]
    }
  }
}

policy "ERASURE-010" {
  title = "Account deletion runs the erasure function"
  statement = "Every DELETE endpoint must always call delete_user_account, the function that removes a user's personal data. This is part of the right to erasure under GDPR Article 17. The check confirms the call is made; it does not confirm that the function deletes every table holding the user's data. An endpoint that cannot call it must be exempted by the policy owner, not left unchecked."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["gdpr"]

  rule {
    check = "object.statement_required"
    params = { functions: ["delete_user_account"], placement: "unconditional", verbs: ["DELETE"], object_kinds: ["query"] }
  }
}

policy "SEC-014" {
  title = "Login tokens expire within an hour"
  statement = "Every login token must expire within one hour, so that an idle or stolen session cannot reach patient data later (HIPAA automatic logoff, 45 CFR 164.312(a)(2)(iii)). A token that signs another payload is exempted by the policy owner."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.param_bound"
    params = { statements: ["security.create_auth_token"], param_names: ["expiration"], min: 1, max: 3600, unit: "seconds" }
  }
}

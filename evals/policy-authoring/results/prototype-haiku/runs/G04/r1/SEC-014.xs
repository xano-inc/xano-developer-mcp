policy "SEC-014" {
  title = "Login tokens expire within an hour"
  statement = "Every authentication token expires within one hour of being created, supporting automatic logoff of idle clinical sessions."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "statement.param_bound"
    params = { statements: ["security.create_auth_token"], param_names: ["expiration"], min: 1, max: 3600, unit: "seconds" }
  }
}

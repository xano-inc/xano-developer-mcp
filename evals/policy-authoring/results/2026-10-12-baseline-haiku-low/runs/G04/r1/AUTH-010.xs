policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint must require authentication, because patient and appointment data sits behind them (HIPAA Security Rule access control, 45 CFR 164.312(a)). An endpoint that must be public, such as login, signup, webhook or health, carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}

policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "HIPAA access control: every endpoint requires a logged-in user, so an anonymous caller cannot reach patient, appointment or clinical note data. A deliberately public endpoint carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}

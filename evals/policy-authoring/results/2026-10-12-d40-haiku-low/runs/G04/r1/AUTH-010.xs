policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint must require authentication. A deliberately public one carries the `public` tag, signed off by the platform owner. Related to HIPAA access control: health data endpoints must not be open to anonymous callers."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}

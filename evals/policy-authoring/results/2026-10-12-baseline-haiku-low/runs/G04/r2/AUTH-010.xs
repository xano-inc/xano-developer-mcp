policy "AUTH-010" {
  title = "Endpoints require login"
  statement = "Every endpoint that reaches the patients, appointments or clinical_notes tables must require a login. An endpoint that must stay public carries the `public` tag, signed off by the platform owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = {
      except_tags: ["public"]
      tables: ["patients", "appointments", "clinical_notes"]
    }
  }
}

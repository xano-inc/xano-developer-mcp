policy "AUTH-010" {
  title = "Endpoints that reach patient data require login"
  statement = "Every endpoint that reads or writes patients, clinical_notes or appointments must require a logged-in caller. An endpoint that is deliberately public must carry the `public` tag, signed off by the platform owner; none of the health endpoints is expected to be public."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { tables: ["patients", "clinical_notes", "appointments"] }
  }
}

policy "HIPAA-010" {
  title = "Endpoints that reach patient records require login"
  statement = "Every endpoint that reads or writes patients, appointments or clinical_notes must require a login (an auth table). A deliberately public endpoint must not reach these tables; if one must, the platform owner exempts it by tag."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "164.312-a-1"]

  rule {
    check = "object.auth_required"
    params = { tables: ["patients", "appointments", "clinical_notes"] }
  }
}

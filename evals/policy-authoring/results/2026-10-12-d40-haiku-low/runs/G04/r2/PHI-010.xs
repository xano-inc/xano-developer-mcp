policy "PHI-010" {
  title = "Endpoints reaching patient records require login"
  statement = "Every endpoint that reaches the patients, clinical_notes or appointments tables requires a logged-in caller. A deliberately public endpoint that touches one of these tables needs its exemption signed off by the policy owner."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["hipaa"]

  rule {
    check = "object.auth_required"
    params = { tables: ["patients", "clinical_notes", "appointments"] }
  }
}

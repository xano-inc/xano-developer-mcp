policy "HIPAA-050" {
  title = "Debug logs in PHI code never log request input"
  statement = "Statements in code that reaches patients, appointments or clinical_notes must not write request input to logs. Logging request data would copy protected health information into log storage."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["hipaa", "164.312-b"]

  rule {
    check = "statement.expression_rule"
    params = { statements: ["debug.log"], param_names: ["value"], must_not_reference: ["$input"], tables: ["patients", "appointments", "clinical_notes"] }
  }
}

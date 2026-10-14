policy "AUTH-030" {
  title = "Users can't make themselves admin"
  statement = "No write may take the role field straight from request input, so a caller cannot promote their own account. Related to SOC 2 CC6.3 (role-based access). A pass shows the stored definitions matched when it ran."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.3"]

  rule {
    check = "db.write_from_input_forbidden"
    params = { fields: ["role"] }
  }
}

policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint tagged admin calls the require_admin_role function as its first statement, passing the logged-in user. Only admin and support_lead users may pass that check. An admin endpoint that cannot call it is reported, and the owner decides any exemption."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.statement_required"
    params = {functions: ["require_admin_role"], placement: "first", must_reference: ["$auth"], tags: ["admin"], object_kinds: ["query"]}
  }
}

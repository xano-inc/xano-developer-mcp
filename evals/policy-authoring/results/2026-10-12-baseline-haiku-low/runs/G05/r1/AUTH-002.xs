policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group must call check_admin_role as its first statement, passing the logged-in user, so that only admin and support_lead users get past it. An endpoint that cannot call the role check first is not exempted by its author; the platform owner decides any exemption."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["check_admin_role"],
      placement: "first",
      must_reference: ["$auth"],
      api_groups: ["admin"],
      object_kinds: ["query"]
    }
  }
}

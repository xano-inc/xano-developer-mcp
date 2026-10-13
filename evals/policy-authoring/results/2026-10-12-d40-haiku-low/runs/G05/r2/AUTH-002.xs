policy "AUTH-002" {
  title = "Admin endpoints check the caller's role"
  statement = "Every endpoint in the admin API group calls the role-check function check_admin_role as its first statement, passing the logged-in user. check_admin_role stops the request unless that user's role is admin or support_lead. An endpoint that cannot make this call needs the policy owner's decision before any exemption."
  severity = "critical"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "hipaa"]

  rule {
    check = "object.statement_required"
    params = { functions: ["check_admin_role"], placement: "first", must_reference: ["$auth"], api_groups: ["admin"], object_kinds: ["query"] }
  }
}

policy "AUDIT-010" {
  title = "Changes to customer email are audited"
  statement = "Every endpoint, AI tool, task or message handler that writes an email address (the email or requester_email field) must call the record_audit_event function unconditionally, so the audit_log records who changed what. Functions that do the write are not inspected by this rule yet: keep the audit call in the caller that always runs. An object that cannot audit its write is exempted by the policy owner, not by tagging it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "audit"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["record_audit_event"],
      placement: "unconditional",
      object_kinds: ["query", "task", "tool", "message"],
      when: {
        fields: ["email", "requester_email"]
      }
    }
  }
}

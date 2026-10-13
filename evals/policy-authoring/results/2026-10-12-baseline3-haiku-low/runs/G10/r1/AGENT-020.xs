policy "AGENT-020" {
  title = "Email agent tools always request human approval"
  statement = "Every AI agent tool that sends email must unconditionally call request_human_approval, so no code path emails a customer without a person approving it."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["agents", "human-approval"]

  rule {
    check = "object.statement_required"
    params = {
      functions: ["request_human_approval"]
      placement: "unconditional"
      object_kinds: ["tool"]
      when: {statement: "util.send_email"}
    }
  }
}

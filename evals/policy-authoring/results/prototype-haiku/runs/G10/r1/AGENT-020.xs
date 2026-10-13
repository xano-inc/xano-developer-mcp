policy "AGENT-020" {
  title = "Customer-facing AI tools need human approval"
  statement = "An AI tool tagged sends-email must call request_human_approval on every path before it acts, so a person approves each email. Tools without the sends-email tag are not covered by this rule. The approval function and tag names are assumptions to confirm."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agent"]

  rule {
    check = "object.statement_required"
    params = { functions: ["request_human_approval"], placement: "unconditional", object_kinds: ["tool"], tags: ["sends-email"] }
  }
}

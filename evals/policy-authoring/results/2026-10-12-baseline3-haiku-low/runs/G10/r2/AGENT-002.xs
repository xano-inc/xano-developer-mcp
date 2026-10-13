policy "AGENT-002" {
  title = "AI agent tools email customers only after human approval"
  statement = "An AI agent tool may send email to a customer only after a person has approved the send. The tool must call request_human_approval before it sends any email."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agents"]

  rule {
    check = "stack.statement_order"
    params = { before: { functions: ["request_human_approval"] }, after: ["util.send_email"], object_kinds: ["tool"] }
  }
}

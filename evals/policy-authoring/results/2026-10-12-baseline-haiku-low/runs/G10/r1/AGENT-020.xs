policy "AGENT-020" {
  title = "AI agent emails need human approval"
  statement = "An AI agent tool that sends an email to a customer must first request approval from a person with request_human_approval, and send only after that approval is granted."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["ai-agents"]

  rule {
    check = "object.statement_required"
    params = {functions: ["request_human_approval"], placement: "unconditional", when: {statement: "util.send_email"}}
  }
}

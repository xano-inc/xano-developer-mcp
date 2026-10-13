policy "AGENT-002" {
  title = "AI agent tools that email customers need human approval first"
  statement = "An AI agent tool that sends email (util.send_email, directly or through a function it calls) must call request_human_approval as its first statement, so a person approves the email before it is sent. The approval call must pass the approved approval_id; this policy checks only that the call comes first."
  severity = "high"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.statement_required"
    params = { functions: ["request_human_approval"], placement: "first", object_kinds: ["tool"], when: { statement: "util.send_email" } }
  }
}

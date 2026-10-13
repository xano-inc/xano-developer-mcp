policy "CHG-001" {
  title = "Endpoints and functions are tested"
  statement = "Every endpoint and function is exercised by a workflow test or unit test that asserts something, and every login-protected endpoint has a test asserting that an anonymous call is rejected. An object that cannot be tested is exempted by the policy owner, not by a tag added to dodge the rule."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query", "function"] }
  }

  rule {
    check = "test.assertion_required"
  }
}

policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. An endpoint that cannot be tested is exempted by the policy owner, never silently."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query"] }
  }

  rule {
    check = "test.assertion_required"
  }
}

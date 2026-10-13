policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint and function is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. An endpoint or function that cannot have a test is exempted by the policy owner, not by the author of the change."
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

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["function"] }
  }
}

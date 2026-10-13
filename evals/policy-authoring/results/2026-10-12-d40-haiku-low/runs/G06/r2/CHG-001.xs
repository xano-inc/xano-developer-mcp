policy "CHG-001" {
  title = "Endpoints and functions are tested"
  statement = "Every endpoint and function is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. Advisory: a finding lists the endpoint or function with no such test."
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

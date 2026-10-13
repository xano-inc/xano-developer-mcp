policy "CHG-001" {
  title = "Endpoints, functions and tasks are tested"
  statement = "Every endpoint, function and task is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. A test that exists but fails still counts for this check."
  severity = "low"
  active = true
  enforcement = "advisory"

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query", "function", "task"] }
  }

  rule {
    check = "test.assertion_required"
  }
}

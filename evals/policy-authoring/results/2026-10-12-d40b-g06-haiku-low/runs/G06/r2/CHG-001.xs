policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint and function is exercised by a test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. Tests must exist and pass before a change ships."
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

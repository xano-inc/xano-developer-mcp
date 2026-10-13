policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is exercised by a workflow test or unit test that asserts something, and every protected endpoint has a test asserting that an anonymous call is rejected. Checks test definitions only, not whether they pass."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["code-review", "soc2"]

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query"] }
  }

  rule {
    check = "test.assertion_required"
  }
}

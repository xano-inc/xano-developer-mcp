policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint must be exercised by a workflow test or unit test that asserts something, and every protected endpoint must have a test asserting that an anonymous call is rejected. Tests are read, not run, so a failing test still counts. This supports change testing evidence; it does not record who approved a change."
  severity = "low"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc8.1"]

  rule {
    check = "object.test_coverage"
    params = { object_kinds: ["query"] }
  }

  rule {
    check = "test.assertion_required"
    params = {}
  }
}

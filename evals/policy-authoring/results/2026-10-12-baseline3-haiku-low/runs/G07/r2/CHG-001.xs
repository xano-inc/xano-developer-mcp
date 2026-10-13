policy "CHG-001" {
  title = "Endpoints are tested"
  statement = "Every endpoint is exercised by a workflow test or unit test that asserts something, so a change to an endpoint is checked before it ships. Every protected endpoint has a test asserting that an anonymous call is rejected. Related to SOC 2 CC8.1 (change management)."
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
  }
}

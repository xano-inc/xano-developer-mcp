policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling instead of reaching the caller as an unhandled error. Handle the failure inside the catch branch. Calls that cannot be wrapped are exempted by the policy owner, not by the author of the change."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request", "stream.from_request", "ai.external.mcp.tool.run", "db.external.postgres.direct_query", "db.external.mysql.direct_query"], must_be_inside: ["try_catch"] }
  }
}

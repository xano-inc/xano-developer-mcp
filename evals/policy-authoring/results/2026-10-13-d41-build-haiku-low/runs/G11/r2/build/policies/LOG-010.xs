policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external call sits inside a try block, so a vendor failure reaches error handling instead of hanging or crashing the request. An external call that cannot be wrapped must be flagged to the platform owner before it is exempted."
  severity = "medium"
  active = true
  enforcement = "advisory"
  tags = []

  rule {
    check = "statement.containment"
    params = {
      statements: [
        "api.request",
        "stream.from_request",
        "webflow.request",
        "ai.external.mcp.tool.run",
        "ai.external.mcp.tool.list",
        "ai.external.mcp.server_details",
        "db.external.mysql.direct_query",
        "db.external.postgres.direct_query",
        "db.external.mssql.direct_query",
        "db.external.oracle.direct_query",
        "db.external.snowflake.direct_query"
      ]
      must_be_inside: ["try_catch"]
    }
  }
}

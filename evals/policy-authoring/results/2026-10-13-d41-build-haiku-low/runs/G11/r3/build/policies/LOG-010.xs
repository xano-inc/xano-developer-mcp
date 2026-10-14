policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external call sits inside a try block, so a vendor failure, timeout or outage reaches error handling instead of hanging or crashing the caller. Covers HTTP requests, streams, MCP tool calls and direct database connections to external systems. This checks that a try block wraps each call, not what the catch does."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = { statements: ["api.request", "stream.from_request", "webflow.request", "ai.external.mcp.tool.run", "ai.external.mcp.tool.list", "ai.external.mcp.server_details", "db.external.postgres.direct_query", "db.external.mysql.direct_query", "db.external.mssql.direct_query", "db.external.oracle.direct_query", "db.external.snowflake.direct_query"], must_be_inside: ["try_catch"] }
  }
}

policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external call (api.request, stream.from_request, webflow.request, api.microservice, api.lambda, the ai.external.mcp statements and the db.external direct queries) must sit inside a try block, so a vendor failure reaches error handling. The catch branch must decide what the caller sees. A call that cannot be wrapped is raised with the policy owner, never exempted by the author."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda", "ai.external.mcp.tool.run", "ai.external.mcp.tool.list", "ai.external.mcp.server_details", "db.external.postgres.direct_query", "db.external.mysql.direct_query", "db.external.mssql.direct_query", "db.external.oracle.direct_query", "db.external.snowflake.direct_query"], must_be_inside: ["try_catch"]}
  }
}

policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external call sits inside the try block of a try_catch, so a vendor outage, timeout or error reaches error handling instead of hanging or failing the caller. Covers HTTP requests, streams, microservices, lambdas, cloud search, external databases, MCP tools and AI agent runs. The try block only proves the call is guarded: the catch block must still handle the failure, which no check reads."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {
      statements: [
        "api.request",
        "stream.from_request",
        "webflow.request",
        "api.microservice",
        "api.lambda",
        "cloud.algolia.request",
        "cloud.elasticsearch.request",
        "cloud.aws.opensearch.request",
        "db.external.postgres.direct_query",
        "db.external.mysql.direct_query",
        "db.external.mssql.direct_query",
        "db.external.oracle.direct_query",
        "db.external.snowflake.direct_query",
        "ai.external.mcp.tool.run",
        "ai.external.mcp.tool.list",
        "ai.external.mcp.server_details",
        "ai.agent.run"
      ],
      must_be_inside: ["try_catch.try"]
    }
  }
}

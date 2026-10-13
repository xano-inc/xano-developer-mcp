policy "LOG-010" {
  title = "External calls handle their own failures"
  statement = "Every external request sits inside a try block, so a vendor failure reaches error handling. Covers HTTP requests, streams, microservice and Lambda calls, cloud search requests and direct external database queries. Checks that each call sits in a try block, not what the catch does with the failure."
  severity = "medium"
  active = true
  enforcement = "advisory"

  rule {
    check = "statement.containment"
    params = {
      statements: ["api.request", "stream.from_request", "webflow.request", "api.microservice", "api.lambda", "cloud.algolia.request", "cloud.elasticsearch.request", "cloud.aws.opensearch.request", "db.external.postgres.direct_query", "db.external.mysql.direct_query", "db.external.mssql.direct_query", "db.external.oracle.direct_query", "db.external.snowflake.direct_query"],
      must_be_inside: ["try_catch"]
    }
  }
}

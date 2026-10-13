// Seeded workspace for the policy-authoring eval. Holds a small multi-tenant SaaS backend; no policies.
workspace policy_authoring_eval {
  acceptance = {ai_terms: true}
  preferences = {
    internal_docs    : false
    track_performance: true
    sql_names        : false
    sql_columns      : true
  }
}
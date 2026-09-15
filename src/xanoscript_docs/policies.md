# Workspace policies (MVP)

Requires a platform build with policy support. A policy is its human description plus deterministic rules, saved as branch-scoped workspace XanoScript. Templates only seed an editable document: there is no template ID, inheritance or later synchronization.

## Quick Reference

```xs
policy AUTH-EXAMPLE {
  title = "Require authentication"
  statement = "Endpoints require authentication unless explicitly marked public."
  lifecycle = "active"
  enforcement = "advisory"
  severity = "high"

  rule AUTH-EXAMPLE.R1 {
    check = "query.auth_required"
    params = { public_tag: "public" }
  }
}
```

Use `advisory` while customizing a seed. `mandatory` findings participate in gates. A `draft` policy is not evaluated; an `active` policy is eligible. Policies can also include rationale, narrative, domain, owner, scope and framework mappings. Long text such as `narrative` can use a `"""` triple-quoted multiline string. `mappings` is a list of objects, for example `mappings = [ { framework: "soc2", criterion: "CC6.1", label: "Logical access security" } ]`. Each rule selects a built-in check and supplies literal parameters. A rule may also carry its own `title`, a `severity` that overrides the policy's for that rule, and a `remediation` sentence that is echoed with the rule's findings. Free-form policy `scope` describes intent; actual check selection is determined by the check's parameters.

## Authoring workflow

1. Read the branch's existing policies and the instance's check catalogue. The catalogue defines exact parameters, supported object kinds and limitations for every check.
2. Write one `policy KEY { ... }` document in `policies/KEY.xs`. Customize its key, statement and rules; do not keep a template association.
3. Validate and format through the native `POST /api:meta/workspace/{id}/policy/parse` endpoint with `{source}`. The result contains `{policy, source}` and writes nothing. With the authenticated Xano MCP, use its policy parse tool.
4. Save canonical source using `POST /policy` or `PUT /policy/{id}` with `{branch, data: {source}}`. Do not combine source with structured fields. The server owns version increments.
5. Evaluate the same branch and inspect its findings. Runs made before edits are historical evidence, not current approval.

Policies also travel in the platform's workspace multidoc import/export. Use the official CLI's `workspace pull` and `workspace push` flow for a local workspace. The authenticated MCP supports workspace exports and one-time upload URLs for large multidocs; upload processes the source on the instance. A mandatory finding reported after a push does not roll back that import. Merge uses fresh evaluation.

## Checks and their limits

The MVP catalogue includes authentication, tags, test-definition coverage, statement prohibition/requirements, parameter presence/bounds/provenance, expression rules, containment, credential-shaped literals, table field attributes/auth settings/views, input rules, object settings/existence, table write locations, trigger self-writes, outbound vendors, middleware, statement order and database where constraints.

Read the live catalogue instead of copying guessed parameter names. Deterministic structural inspection does not execute tests or prove arbitrary data flow, runtime authorization or compliance. Inspect each check's documented limitations and findings, especially dynamic values and unresolved references.

## Validation and access

The standalone developer MCP's bundled language server does not validate policy syntax. It must not report these files as successfully validated. Use native policy parsing; do not rewrite a policy into another object type to satisfy the local validator.

Read, parse and evaluate need `workspace:policy` read access. Writes additionally need the matching operation scope and an admin/explore role. Existing tokens may need reissuing. The authenticated MCP takes instance and workspace from its request authentication; it does not accept arbitrary targets.

A policy is its description plus deterministic check rules. Checks inspect stored definitions and nothing runs at request time.

# Plan (written before building)

## Objects to build
None. The check reads the endpoints and their saved auth setting directly, so no middleware, function, table or task is needed.

## Changes to existing objects
None. The policy will report one existing endpoint: `workspace/api/app/invoices/export_GET.xs` (`query "invoices/export"`, no `auth` line). It returns every invoice and is the case the customer is worried about. Fixing it means enabling login on an endpoint, which changes who can call it, so I will not change it. The finding is for the customer to decide.

## Policy
Key `AUTH-010` (template "Endpoints require login"), `active = true`, `enforcement = "advisory"`, severity high.
- Rule 1: `object.auth_required` with `tables: ["invoices"]`. Every endpoint that reaches the `invoices` table, directly or through a function it calls, must require login. This covers the export and any new endpoint that reads invoices.

## Not checked
- Whether the endpoint returns the whole table: no paging limit on the new rule (PERF-001 / `statement.param_bound` would cover that, not asked for here).
- Whether the login check is correct (who is allowed in, row ownership): the check only reads the saved auth setting.
- Runtime behaviour, environments, and any endpoint that reads invoices through an external service.

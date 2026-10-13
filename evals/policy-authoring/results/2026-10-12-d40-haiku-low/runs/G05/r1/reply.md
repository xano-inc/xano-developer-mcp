I've drafted two policies for you: `AUTH-002` and `TENANT-ORG-010`, in `out/AUTH-002.xs` and `out/TENANT-ORG-010.xs`. Both parse cleanly. I have not published or pushed them, and I have not run `xano policy evaluate`. The findings below are predictions from reading your endpoints, not results.

## 1. `AUTH-002`: admin endpoints check the caller's role first

- Applies to every endpoint in the `admin` API group (served at `/api:admin`). It requires `check_admin_role` to be the first statement, passing `$auth`.
- Predicted to fail today:
  - `api/admin/tenants_GET`: never calls `check_admin_role`.
  - `api/admin/tenants/{tenant_id}` (PATCH): calls `db.get` on `tenants` before the role check, so the check is not first.
- Predicted to pass: `api/admin/users_GET` and `api/admin/orgs/{org_id}/tenants_GET`.

Limits:
- The policy checks that the call comes first. It does not check that `check_admin_role` allows only `admin` and `support_lead`. Right now that is the `precondition` in the function, and no check reads its logic.
- Scope is the `admin` API group, not a URL prefix. The app-group endpoint `app/admin/stats` is served at `/api:app/admin/stats`, so it is not covered. If you want it covered, tell me and I'll propose a tag for it.

## 2. `TENANT-ORG-010`: tenants are only read or written with an `org_id` filter

- Applies to every read and write of the `tenants` table. It requires the statement to constrain `org_id`.
- Predicted to fail today:
  - `api/admin/tenants_GET`: `db.query tenants` with no filter.
  - `api/admin/tenants/{tenant_id}` (PATCH): `db.get` and `db.edit` by `id` only.
  - `api/app/admin/stats`: a count over `tenants` with no filter.
- Predicted to pass: `api/admin/orgs/{org_id}/tenants_GET`, which filters on `$input.org_id`.

Limit:
- It checks that an `org_id` filter is there, not which value it has. I did not tie it to the caller's org (`$auth.org_id`), because admin staff may legitimately work across orgs. Tell me if support staff should be limited to their own org, and I'll add that comparison.

## What I did not cover

- What `check_admin_role` allows (see above).
- Which endpoints count as "under /admin" beyond the `admin` API group.

## Not changed

I did not touch your workspace. The fixes for the predicted findings are code changes to the endpoints (and, for the PATCH endpoint, moving the role check above the `db.get`). I'll propose those separately, since they change who can call those endpoints.

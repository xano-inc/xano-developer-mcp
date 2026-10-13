I've drafted two policies for your admin API. Nothing is published or pushed; they sit in `out/` for you to review.

**1. `AUTH-002` — admin endpoints call the role check first** (`out/AUTH-002.xs`)
- Requires every query in the `admin` API group to call `check_admin_role` as its first statement, with `$auth` passed in.
- The policy checks that the call is made first. The role test ("admin" or "support_lead") lives inside `check_admin_role`, which I read and which does that test.

**2. `AUTH-021` — tenant access is filtered by org_id** (`out/AUTH-021.xs`)
- Requires every read and write of the `tenants` table in admin endpoints to filter on `org_id`.
- I left the comparison value open on purpose. Support staff look up tenants of an org they are not a member of, so tying the filter to the caller's own org (`$auth.org_id`) would break that. If you want the filter pinned to the caller's org, tell me and I'll change it.

Both are `active = true` and `enforcement = "advisory"`, so they report findings but block nothing. Switching to `blocking` would refuse merges and set-lives that add a finding; say if you want that.

**What I expect the current workspace to report** (from reading the files; I did not run an evaluation):
- `tenant_id_PATCH` calls `db.get` on tenants before the role check, and its `db.get` and `db.edit` pick the row by id with no org_id filter. It fails both policies.
- `tenants_GET` has no role check and reads tenants with no filter. It fails both.
- `orgs/org_id/tenants_GET` calls the role check first and filters by org_id. It passes.
- `users_GET` calls the role check first. It passes the role policy.

**Gaps you need to decide on:**
- **`/admin/stats` is not covered.** It is in the `app` API group, under an `admin/` path, and it reads tenants with no role check and no org filter. The policies scope by API group, and there is no path-based scope. To cover it, either move it into the `admin` group or give it the `admin` tag and I'll scope the rules by tag. I did not change the workspace.
- **The `admin` API group has no tags.** Scoping by tag is the more durable option, but that needs a tag on the group, which is a workspace change I can't make here. The rules use the group name `admin` for now; a renamed group would silently stop matching.

I did not run `xano policy evaluate` or push anything, so the findings above are my reading and need confirming by evaluation.

Here are two advisory policies for the admin and tenant rules. They flag violations and block nothing until you change them to blocking.

**Admin role check** (`AUTH-002`): every endpoint tagged `admin` must call the role-check function as its first statement, passing the logged-in user. The rule checks that the call is first. It does not check what the function decides, so the function itself must allow only `admin` and `support_lead`. The file assumes that function is `require_admin`.

**Tenant scoping** (`TENANT-010`): every read and write of the `tenants` table must filter on `org_id`. The rule checks each object's own statements. A helper function that reads `tenants` by a passed-in id is reported on that function, so review those separately.

**Gaps and assumptions**

- **"Under /admin"**: Xano policies cannot scope by URL path. The file uses the `admin` tag, so every admin endpoint must carry that tag. An untagged endpoint is not checked.
- **Role values**: the check cannot confirm the function allows exactly `admin` and `support_lead`. That has to be verified in the function's code.
- **Names**: `require_admin`, the `admin` tag, and the `tenants` table with an `org_id` field are placeholders. Your workspace's names will differ.

Nothing has been published to your workspace yet.

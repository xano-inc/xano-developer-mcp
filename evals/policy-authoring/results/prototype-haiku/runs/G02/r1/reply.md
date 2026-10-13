Here is a naming policy set to warn only. It flags violations and blocks nothing, so nobody's push or save is refused.

**What it checks**

- **Endpoints** (`NAME-010`): every segment of an endpoint path must be lowercase snake_case, such as `/v1/get_invoice`. A `{param}` segment is skipped.
- **Functions** (`CONV-010`): every function name must be lowercase snake_case and start with your client prefix. The file uses `acme_` as a placeholder, so set each client workspace's own prefix before you use it.

**What it does not check**

- **Plural table names.** Xano has no check that tells a plural name from a singular one, and a pattern guess would flag the wrong names (`address`, `status`). Tables need a manual review, or a naming tag and a team rule.

**Things to decide**

- Endpoint paths are judged, not endpoint names. If you want the endpoint's display name checked instead, say so.
- Renaming a path or function changes the URL or the `function.run` calls that use it, so the policy does not rename anything. Existing names that you want to keep can be listed in `allowed_names` or tagged and listed in `except_tags`. That exemption is for the policy owner to decide.
- The prefix is per workspace, so each of the 12 clients needs its own copy with its own prefix.

Nothing has been published to your workspace yet.

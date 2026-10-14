---
name: xano-policies
description: "Write, change and review Xano governance policies with the xano CLI, and fix policy findings. Covers the policy file format under policies/, the full built-in check catalogue with every check id and its params, how to scope a rule, what the exit code of xano policy evaluate and xano workspace push means, and the authoring and honesty rules. Load this whenever the request mentions policies, rules, checks, findings, governance or compliance, a xano policy command, the policy_check a push returns, or touches any file under policies/."
---

# Xano policies

A Xano governance policy is a workspace object stored as XanoScript: a plain-language `statement` of what it requires plus `rule` blocks, each naming one built-in **check** and the params that aim it. Running the policies checks the current branch's stored object definitions against every `active` policy's rules and records **findings**: one per object that failed a rule.

The catalogue below is the entire vocabulary: a rule naming an unlisted check id or param name is refused on save. This skill is the platform's: no file is behind it, so never cite or link a path for it.

## File format

One policy per file, at `/policies/<KEY>.xs`, where `<KEY>` is the key in the header: up to 64 letters, digits, dots, underscores and dashes, starting with a letter or digit, so `AUTH-010` lives at `/policies/AUTH-010.xs`. Studio refuses to publish a policy file named otherwise.

```
policy "AUTH-010" {
  title = "Endpoints require authentication"
  statement = "Every endpoint must require authentication. A deliberately public one carries the `public` tag, signed off by the platform owner."
  severity = "high"
  active = true
  enforcement = "advisory"
  tags = ["soc2", "cc6.1"]

  rule {
    check = "object.auth_required"
    params = { except_tags: ["public"] }
  }
}
```

- Always write `title` and `statement`, which also carries the guidance: why the policy exists and how an object that cannot comply is exempted. There is no `remediation` field, and no `owner` field either: writing one is refused.
- **A policy file carries no comments.** `//` and `/* */` inside a policy block are not comments; the save is refused. Put the explanation in `statement`.
- **`guard` and `test` blocks are reserved** and refused, even empty. If asked for one, say it is reserved for a later phase, not that the platform will never have it.
- `active` is `true | false`: **only an active policy is evaluated**. `enforcement` is `advisory | blocking`: an active blocking policy's findings **block**: they refuse a merge, a set-live, a save or push to the live branch that would introduce them, and a tenant deploy of a release that has any. A policy save is never blocked. A rule that cannot run on an active blocking policy makes the branch gates `unavailable`, and the change goes through ungated until every rule can run (a tenant deploy still refuses blocking findings). A change is judged by the policies the branch will have after it. Each policy change needs only its own `workspace:policy` level: update to edit, delete to delete.
- **Write a new policy `active = true` + `advisory`**: it blocks nothing and its findings are visible. Asked to prevent something ("never", "block", "can't ship"), write it advisory all the same and say that making it blocking is its owner's choice, and what it would then block. Use `active = false` only when the author wants nothing evaluated yet, and say an inactive policy never runs. On an existing policy leave both alone unless asked; before changing either, say whether it starts or stops blocking.
- **A rule cannot be named**: write `rule { ... }`, never `rule foo {`. Ids derive from position as `<KEY>.R1`, `<KEY>.R2`, and stored runs cite them, so keep existing rules in ORDER and add new ones at the end. A rule `title` is optional: give one only when the scope makes its check's label misleading.
- `severity` is the policy's, one of `critical | high | medium | low`: it orders findings and never blocks. A rule cannot carry one.
- A rule warning on your rule means it is wrong: fix it before you report. A warning that a table, tag, API group, function or statement does not exist means the rule judges nothing: use a name the workspace has, or one your plan builds (step 6); never accept the warning.
- `params` lists ONLY the settings you set: an omitted param takes its catalogue default, so never repeat one, and omit `params` when the check needs nothing.

## Scoping a rule

Every check also accepts these scope params, which narrow the objects a rule inspects. Each is a top-level param (there is no `scope` object), all must match, and an empty or omitted list means "everything the check supports", never "nothing". Scope limits what is reported, not what is read.

- `tags` / `except_tags` (string[]): only, or all but, objects carrying any of these exact tags (an endpoint also carries its API group's tags). `except_tags` is how an exemption is expressed.
- `api_groups` (string[]): endpoints in these API groups, by exact display or canonical name. From a URL (`…/api:Wc2fF8c4/billing`) the canonical name is `Wc2fF8c4`, without `api:`, and `billing` goes in `paths`.
- `paths` (string[]): endpoints whose path inside its API group starts with a listed path, segment by segment (`admin` selects `admin/users/{id}`, never `administrator`); `*` is any one segment, an endpoint's `{param}` matches any segment, an entry's `{param}` only a path parameter; case-sensitive; no URL, `api:` prefix, regex or `**`. `except_paths` (string[]): exempt endpoints under a listed path (`admin/login`).
- `verbs` (string[]): endpoints with these HTTP verbs, case-insensitive.
- `endpoint_auth` (`required` | `none`): only endpoints that require authentication, or only public ones. Xano knows which endpoints are public; never invent a tag to restate it.
- `tables` (string[]): tables by exact name, or objects that reach one directly or through a called function, an attached addon or an enabled agent/MCP tool mapping. `reaching_table_tags` (string[]): objects that reach a table carrying any of these exact tags.
- `object_kinds` (string[]): only these kinds, from those the check inspects. Object kinds: table, query, function, workflow_test, api_group, task, trigger, middleware, addon, channel, message, tool, agent, mcp_server, workspace.

`api_groups`, `paths`, `verbs` and `endpoint_auth` select endpoints only.

Scope params work on every check that lists them. **Scope by what Xano knows** (authentication, path, API group, verb, the tables the user names) **and by tags for what it does not** (data classes, owner teams, deliberate exceptions). When the user names tables, API groups or a path, scope by them (`object.auth_required` with `tables: ["invoices"]`, `paths: ["admin"]` for "everything under /admin") and say so: a path is the endpoint's own URL, so a new endpoint under it is in scope as soon as it exists; never restate one as a tag. Write a tag only if the workspace has it or your plan adds it (step 6).

## The check catalogue (37 checks)

`[...]` lists the object kinds a check inspects, `*` marks a required param, `+` the params a rule must set at least one of, `=` a default. `stack` stands for the kinds that carry a statement stack: query, function, task, trigger, middleware, addon, tool, message.
### agent.tool_allowlist: Agents and MCP servers enable only approved tools [agent, mcp_server]
Reports AI agents and MCP servers that enable a tool that is not approved, and enabled tools that run an external MCP tool that is not approved.
- tools string[]: Approved workspace tools, by exact name; any enabled tool listed here passes.
- tool_tags string[]: A tool carrying any of these exact tags (its own tags) is approved, so a reviewer approves a tool once by tagging it.
- external_tools string[]: Approved tool names on external MCP servers, the servers outside this workspace that an enabled tool calls with ai.external.mcp.tool.run, in its stack or a function it calls.
Fix: Approving a tool for an agent or MCP server is the policy owner's decision: report the tool and ask. To remove it, set active = false on its entry in the agent's or server's tools list, or delete the entry. Never add it to tools, tool_tags or external_tools yourself, and never tag a tool to approve it unless the owner asked for exactly that.
Use: Agents use only lookup_order and refund_order, and only zendesk_search from Zendesk's MCP. `{object_kinds: ["agent"], tools: ["lookup_order", "refund_order"], external_tools: ["zendesk_search"]}` external_tools names tools an approved tool calls on an external MCP server, matched on any server; approve only Zendesk's host with outbound.vendor_allowlist.
Use: No MCP server exposes a tool that has not been reviewed. `{object_kinds: ["mcp_server"], tool_tags: ["reviewed"]}` A reviewer approves a tool once by tagging it reviewed.
Use: Agents reaching patient data use only approved tools. `{reaching_table_tags: ["phi"], tool_tags: ["phi-approved"], external_tools: ["search_web"]}` external_tools approves the one external MCP tool those tools may run.
### db.output_fields_forbidden: Statements do not fetch listed fields [stack]
Reports database reads and writes that fetch a listed field, or a field marked sensitive, from their table.
- fields+ string[]: Exact field names that must not be fetched; table.field restricts a name to that table.
- include_sensitive+ bool=true: Also forbid fields marked sensitive in the table schema and password-typed fields.
- table_tags string[]: Only tables carrying any of these tags are reported; empty means every table.
Fix: Remove the field from the statement's output list, or list the output explicitly without it, and say what callers stop receiving. When the object must read it (to verify a password, say), the rule does not fit that object: exempting it is the policy owner's decision, not a fix.
Use: Endpoints never return password hashes or social security numbers. `{fields: ["user.password_hash", "ssn"], object_kinds: ["query"]}`
Use: Endpoints never return fields marked sensitive from tables tagged pii. `{table_tags: ["pii"], object_kinds: ["query"]}`
### db.where_constraint_required: Reads and writes constrain a required field [stack]
Requires every read and write of the selected tables to filter on a chosen field, such as the owner, optionally against a value such as the logged-in user.
- table_selector object{names, tag, has_field, has_fk_to}: Tables whose reads and writes are judged; empty means every table that has field.
- field* string: Exact field a predicate must constrain, on the statement's own table, written on either side of the operator.
- compare_to string: Reference required in the same predicate, e.g. $auth.id; empty permits any comparison on the field.
Use: Users only read and change their own orders. `{field: "user_id", compare_to: "$auth.id", table_selector: {names: ["orders"]}}` table_selector picks which reads and writes are judged; the tables scope picks which objects are inspected.
Use: Every read of a table with tenant_id filters on the caller's tenant. `{field: "tenant_id", compare_to: "$auth.tenant_id", table_selector: {has_field: "tenant_id"}}`
### db.write_from_input_forbidden: Writes don't take protected fields from input [stack]
Reports database writes that take a whole record, or a protected field such as a role, straight from request input.
- statements string[]: Record writes to inspect; empty means all, including ones added later.
- fields string[]: Protected field names; empty checks only whole-record assignments.
Use: Users can't set their own role or plan. `{fields: ["role", "plan"]}`
Use: No write copies a whole request body into a record. `{}`
### literal.credential_shape: Definitions avoid recognizable credential literals [every kind but api_group, channel]
Reports secrets, such as API keys, tokens and private keys, written as literal values instead of environment variables.
- patterns string[] of stripe|aws|github|pem|openai|anthropic|google_api|slack|sendgrid|twilio|jwt|url_credentials|literal_keys: Built-in patterns to match; empty means all, including ones added later.
- locations string[] of definition|env|agent_settings: Where to scan: definition, env or agent_settings.
- allowed_secrets string[]: Fingerprints ("sha256:" + 64 lowercase hex) of reviewed values to skip; never the values.
Fix: Use a workspace environment variable ($env) instead of the literal; the user sets its value and rotates the exposed one, never you in a file. Never quote any part of the value, even a prefix. A value already in an environment variable is in place: change nothing, and leave narrowing the rule's locations to the owner. Allowing a value by its fingerprint (allowed_secrets) is the owner's call; never add one.
Use: No API key, token or private key is written into code. `{}`
Use: Environment values are scanned too, before an export is shared. `{locations: ["definition", "env", "agent_settings"]}`
### object.auth_required: Endpoints require authentication [query, message]
Requires each endpoint and realtime message handler in scope to require a login (an auth table); a handler naming none is reported like a public endpoint.
Fix: Enabling auth changes who can call the endpoint or handler: ask first, naming the auth table you would use. If it is deliberately public (login, signup, webhook, health), exempting it (the policy's except_tags) is the policy owner's decision: propose it, never apply it.
Use: Endpoints that touch invoices require login. `{tables: ["invoices"]}` tables judges the endpoints reaching the tables the user names; no tag is needed.
Use: Every endpoint requires login except the ones tagged public. `{except_tags: ["public"]}`
Use: Realtime message handlers require login. `{object_kinds: ["message"]}`
### object.description_required: Objects, inputs and fields have descriptions [every kind but workspace]
Requires a description on each object in scope; in XanoScript the // comment lines directly above an object, an input or a field are its description.
- require_on string[] of object|input|table_field: What must have a description.
- allowed_fields string[]: Table fields that need no description, by exact name.
- min_length integer=1: Fewest characters a description must have, not counting spaces at either end.
Fix: Write a description that says what the object, input or field is for, in words its callers need, at least as long as min_length; never pad it to reach that length. For an AI tool, the text judged is its instructions (its description only when it has none), so write those. When the purpose is unclear, ask. In XanoScript, the description is the // comment lines directly above the object, input or field, not a code comment: write or edit those lines, and never add a description = line as well, which doubles it. An AI tool's own instructions are set by its instructions = line.
Use: Every function says what it does in a sentence. `{object_kinds: ["function"], min_length: 20}`
Use: Every table field has a description. `{object_kinds: ["table"], require_on: ["table_field"]}`
### object.input_rules: Endpoint, tool and message inputs declare types, filters and bounds [query, tool, message]
Checks the inputs that endpoints, AI tools and message handlers declare: their types, filters, page-size limits, required inputs and values in the URL path.
- type_by_name+ object{<input name>}: Map input names to required declared types.
- filters_required+ string[]: Filter names each selected input must declare.
- paging_max_required+ bool=false: Require a literal max filter on every input reaching per_page.
- path_params_forbidden+ string[]: Path parameter names forbidden in an endpoint path, as {name}.
- inputs_required+ string[]: Input names every selected object must declare.
- filter_min+ object{<filter name>}: Map filter names to minimum numeric arguments, e.g. {"min": 8}.
- input_names string[]: Inputs the filter conditions apply to, dotted for a nested input.
Fix: Without input_names, filter rules reach every text input; set input_names to target inputs, one rule per group.
Use: Passwords are at least 12 characters. `{input_names: ["password"], filter_min: {min: 12}}`
Use: List endpoints cap their page size. `{paging_max_required: true}`
Use: Email inputs are typed as email. `{type_by_name: {email: "email"}}`
### object.middleware_required: Objects attach required middleware [query, function, task, tool, message]
Requires each named middleware to be attached and active on every object in scope, before or after the object runs as selected.
- middleware* string[]: Exact names of middleware that must be attached and active.
- phase string of any|pre|post="any": pre runs before the object's stack, post after it, any in either.
Fix: Attaching per object replaces inherited middleware; prefer the API group, channel or branch default, and ask.
Use: Every logged-in endpoint runs the rate limiter before its stack. `{middleware: ["rate_limit"], phase: "pre", endpoint_auth: "required", object_kinds: ["query"]}`
Use: Everything under /internal runs the IP allowlist first. `{middleware: ["ip_allowlist"], phase: "pre", paths: ["internal"], object_kinds: ["query"]}` paths selects every endpoint under the path, new ones included, with no tag needed.
### object.naming: Names follow a naming convention [every kind but channel, workspace]
Reports names that break a team's naming convention: case style, length, prefixes or suffixes, the first word, forbidden words or a pattern.
- name_kind* string of object|endpoint_path|table_field|input: What kind of name this rule judges.
- case_style+ string of ""|snake_case|kebab-case|camelCase|PascalCase|lowercase: Case style every judged name must be written in: snake_case (get_user) or kebab-case (get-user), lowercase words joined by single _ or -; camelCase (getUser) or PascalCase (GetUser), letters and digits only; or lowercase (no capitals).
- min_length+ integer: Fewest characters a judged name may have, prefix and suffix included.
- max_length+ integer: Most characters a judged name may have, prefix and suffix included.
- prefixes+ string[] (only when name_kind is object|table_field|input): Each judged name must start with one of these, exactly as written (case-sensitive), such as fn_ or nightly_.
- suffixes+ string[] (only when name_kind is object|table_field|input): Each judged name must end with one of these, exactly as written (case-sensitive), such as _job; case_style, first_word_must_be and words_forbidden read the name without it.
- first_word_must_be+ string[] (only when name_kind is object|table_field|input): The first word of each judged name must be one of these, such as a verb list.
- words_forbidden+ string[]: No word of a judged name may be one of these.
- pattern+ string: Advanced: a regular expression every judged name must match, in addition to the other options.
- version_required+ bool=false (only when name_kind is endpoint_path): Endpoint paths must start with a version segment such as v1, v1.0 or v1beta1.
- foreign_key_name+ string (only when name_kind is table_field): How a field that links to another table must end.
- foreign_key_list_name+ string (only when name_kind is table_field): How a list field that links to another table must end, written as for foreign_key_name.
- allowed_names string[]: Names this rule skips, exactly as written (case-sensitive).
Fix: Renaming changes every reference to the name: endpoint URLs that callers use, function.run calls, table and field names in queries. Ask before renaming. To keep an existing name, list it in allowed_names or tag the object and list the tag in except_tags.
Use: Table names are plural. `{name_kind: "object", object_kinds: ["table"], suffixes: ["s"]}` A suffix is literal text: a plural such as people needs an allowed_names entry.
Use: Endpoint paths are snake_case. `{name_kind: "endpoint_path", case_style: "snake_case"}` With CONV-012 in place, change its case_style rather than adding a second naming policy.
Use: Function names start with a verb. `{name_kind: "object", object_kinds: ["function"], first_word_must_be: ["get", "list", "create", "update", "delete"]}`
### object.settings_forbidden: Objects avoid forbidden settings [every kind]
Reports objects whose settings have a forbidden value, such as middleware that silently swallows exceptions.
- object_kind* string (one object kind): Inventory kind to inspect.
- when* object{<setting>}: Map setting names to predicates; all must match.
Settings: query: external_access bool=true, cache.active bool=false, cache.ttl number=3600, response_type standard|stream="standard"; middleware: exception_policy silent|rethrow|critical="silent", response_strategy merge|replace="merge"; api_group: active bool=true, swagger bool=true, swagger.require_token bool=false; task: active bool=true, datasource string; trigger: active bool=true; agent: model_provider amazon-bedrock|anthropic|azure-openai|google-genai|google-vertexai|grok|litellm|openai|openrouter|xano-free; mcp_server: active bool=true; table: auth bool=false; workspace: swagger bool=false, swagger.require_token bool=false.
Use: No endpoint caches its response for more than an hour. `{object_kind: "query", when: {"cache.active": {equals: true}, "cache.ttl": {gt: 3600}}}`
Use: API documentation requires a token. `{object_kind: "api_group", when: {swagger: {equals: true}, "swagger.require_token": {equals: false}}}`
Use: AI agents use only approved model providers. `{object_kind: "agent", when: {model_provider: {not_in: ["openai", "anthropic"]}}}`
### object.statement_required: Objects call a required function or statement [query, tool, task, message]
Requires each object in scope to call a given function or statement, anywhere, on every path, or as its first statement.
- statements+ string[]: Statements to require, any one of them.
- functions+ string[]: Custom functions to require a call to, any one of them.
- placement string of any|unconditional|first="any": any counts a match anywhere; unconditional one that always runs; first only the object's very first statement, so two rules requiring different first statements of the same objects conflict and one always fails (require one first and the other unconditional).
- must_reference string[]: Require every listed reference on the matching statement.
- when object{statement, tables, fields, hosts}: Only inspect objects with a statement matching every condition below; empty inspects every object in scope.
Use: Every scheduled task records an audit event. `{functions: ["record_audit_event"], placement: "unconditional", object_kinds: ["task"]}`
Use: Endpoints that edit employees call the HR role check. `{functions: ["require_hr_role"], when: {statement: "db.edit", tables: ["employee"]}}`
Use: Admin endpoints check the role first. `{paths: ["admin"], functions: ["require_admin"], placement: "first", must_reference: ["$auth"], object_kinds: ["query"]}` admin selects every endpoint under /admin, never /administrator; except_paths exempts one, such as admin/login.
### object.tag_required: Objects carry a tag from a required set [every kind but workspace]
Requires each object in scope to carry at least one tag from tag_set, such as an owner team or a data classification.
- tag_set* string[]: The tags to choose from.
Use: Every function names its owning team. `{tag_set: ["team-billing", "team-growth"], object_kinds: ["function"]}`
### object.tag_vocabulary: Tags follow the agreed vocabulary [every kind but workspace]
Reports tags outside the workspace's tag vocabulary, such as PII beside pii.
- allowed_tags+ string[]: Exact tags that are always accepted.
- case_style+ string of ""|snake_case|kebab-case|lowercase: A style that every tag not in allowed_tags must be written in.
- prefixes+ string[]: A tag not in allowed_tags must start with one of these, followed by at least one more character.
Use: Tags come from the agreed list. `{allowed_tags: ["pii", "phi", "public", "internal"]}`
Use: Team tags start with team-. `{prefixes: ["team-"], allowed_tags: ["pii", "public"]}`
### object.tagged_table_access: Objects reaching tagged tables declare auth and an audit call [query, message, tool, task]
Requires every object that reaches a table carrying a sensitive-data tag to require a login and, when a function is named, to always call it, such as an audit function.
- table_tags* string[]: Exact table tags; reaching any of them puts an object in play.
- auth_tables string[]: Auth tables an endpoint or message handler must declare one of; empty accepts any.
- function string: Function the object must call unconditionally in its own stack.
Use: Anything reaching tables tagged phi requires login and calls the access log. `{table_tags: ["phi"], function: "log_phi_access"}` It judges only tables carrying the tag: tag them first. For tables the user names, use object.auth_required with tables.
Use: Only clinician logins reach patient tables. `{table_tags: ["phi"], auth_tables: ["clinician"]}`
### object.test_coverage: Objects are covered by a test [query, function, tool, task, middleware]
Requires each selected endpoint, function, AI tool or task to be called by a test that then asserts something.
Use: Every function has a test. `{object_kinds: ["function"]}`
Use: Endpoints that touch payments are tested. `{tables: ["payments"], object_kinds: ["query"]}`
### object.unused_input_forbidden: Declared inputs are read [query, function, tool, message, addon]
Reports inputs that an endpoint, function, AI tool, realtime message handler or addon declares but never reads.
- allowed_inputs string[]: Inputs never reported, by exact name, in every object the rule inspects.
- include_nested_inputs bool=false: On: also report fields inside object inputs that nothing reads, by dotted name (address.zip).
Fix: Removing an input changes the API contract that clients, agents and callers see. Check who sends it before deleting it, and list it in allowed_inputs if it is kept on purpose. A read that sits only in disabled code means that code was meant to use it: decide whether to restore or delete the code first.
Use: Endpoints declare only the inputs they use. `{object_kinds: ["query"]}`
Use: Unused inputs are reported, except api_version. `{allowed_inputs: ["api_version"]}`
### outbound.vendor_allowlist: Outbound calls go only to approved vendors [stack, agent]
Reports outbound requests, and cloud, email and AI model providers, that are not on the approved vendor lists.
- kinds string[] of http|cloud|email|agent.llm|db.external|lambda: Destinations to inspect; empty means all, including ones added later.
- hosts string[]: Approved hostnames, matched case-insensitively; empty reports every host as not yet reviewed.
- providers string[]: Exact provider IDs, e.g. aws, google, azure, xano, openai or anthropic; empty reports all as not yet reviewed.
- env_hosts string[]: Environment variable names approved as destinations.
- literal_urls_forbidden bool=false: Report every http and db.external destination written directly into the stack, even one hosts approves.
Fix: Approving a vendor is the policy owner's decision: report the host and ask, or ask the owner to approve the env var in env_hosts. Never add it to the allowlist yourself, and never replace a dynamic URL with a literal. A literal URL reported because literal_urls_forbidden is on moves into an environment variable: ask the owner which variable holds it, to set it in each environment, and to list it in env_hosts; never list it yourself.
Use: Requests only go to Stripe and our own domain. `{kinds: ["http"], hosts: ["api.stripe.com", ".example.com"]}`
Use: AI agents only use OpenAI or Anthropic models. `{kinds: ["agent.llm"], providers: ["openai", "anthropic"]}`
Use: Vendor URLs come from environment variables, never literals. `{kinds: ["http"], env_hosts: ["PAYMENTS_BASE"], literal_urls_forbidden: true}`
### stack.disabled_statement_forbidden: Stacks hold no disabled statements [stack (no addon), workflow_test]
Reports statements switched off with disabled anywhere in an object's stack.
- allowed_statements string[]: Statements that may stay disabled, such as a debug.log a team switches on while debugging.
Fix: Delete the disabled statement once nobody needs it. Do not enable it just to clear the finding: it was switched off on purpose, and enabling it changes what the object does, so ask its owner. A statement the team switches on while debugging goes in allowed_statements.
Use: No switched-off code is left in a stack. `{}`
Use: Only disabled debug logs may stay. `{allowed_statements: ["debug.log"]}`
### stack.size_limit: Stacks stay within statement and nesting limits [stack (no addon)]
Reports an object whose own stack holds more than max_statements statements or nests blocks more than max_nesting levels deep. A user's "lines" are statements here, roughly one per line of logic.
- max_statements+ integer: The most statements an object's stack can hold, counting the statements inside blocks.
- max_nesting+ integer: The most nesting levels a stack can reach.
Fix: Move a coherent part of the stack into a function and call it. To flatten nesting, stop early instead of wrapping the rest of the stack in another conditional: use a return, a continue inside a loop, or a precondition when the case is an error. Never disable, delete or comment out statements to get under the limit. Raising the limit or exempting the object is the policy owner's call.
Use: Endpoints hold at most 30 statements. `{max_statements: 30, object_kinds: ["query"]}`
Use: Functions hold at most 80 statements. `{max_statements: 80, object_kinds: ["function"]}` One rule per kind gives each kind its own limit.
Use: Nothing nests more than 3 levels deep. `{max_nesting: 3}`
### stack.statement_forbidden: Stacks exclude listed statements [stack]
Reports forbidden statements anywhere in an object's stack or in a function it calls.
- statements* string[]: Statement names to forbid.
Use: AI tools can't delete records. `{statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"]}`
Use: Nothing calls an external MCP server. `{statements: ["ai.external.mcp.*"]}`
Use: Public endpoints don't send email. `{statements: ["util.send_email"], endpoint_auth: "none", object_kinds: ["query"]}`
### stack.statement_order: A statement comes before another [stack]
Requires one statement to always run before another, at any depth, such as a permission check before a database write.
- before* object{statements, functions, must_reference}: Guard required ahead of each after match.
- after* string[]: Statement names each of which must follow before.
Use: Records are deleted and emails sent only after an approval check. `{before: {functions: ["require_approval"]}, after: ["db.del", "db.bulk.delete", "util.send_email"]}` It confirms the call comes first, not what the function decides.
Use: Charges run only after the order is validated. `{before: {functions: ["validate_order"]}, after: ["api.request"], tables: ["orders"]}`
### stack.unused_variable_forbidden: Assigned variables are read afterwards [stack (no addon), workflow_test]
Reports a value given to a variable that nothing reads afterwards. By default it judges only variables made with var or changed by a change statement: a result stored with `as` counts only when `include_results_of` lists its statement.
- include_results_of string[]: Statements whose result must be read: a variable one of them stores with as (db.query … as $users) is reported when nothing reads it.
- allowed_variables string[]: Variables never reported, by exact name (legacy_total) or by a prefix ending in * (_*).
Fix: Remove the variable, not the work. For a statement result, delete as $name and keep the statement: db.add, api.request and function.run still have to run. For a var or a change statement that nothing reads, delete that statement. A read that sits only in disabled code means that code was meant to use it: decide whether to restore or delete the code first.
Use: Every variable is read after it is set. `{}`
Use: Query results are used. `{include_results_of: ["db.query", "db.get"]}`
### statement.containment: Statements meet nesting requirements [stack]
Requires or forbids blocks around selected statements, such as a try/catch around external requests, or requires statements nested inside them.
- statements* string[]: Statements to inspect.
- must_be_inside+ string[]: Require one of these enclosing blocks, at any depth; try_catch means its try branch.
- must_not_be_inside+ string[]: Forbid any of these enclosing blocks, at any depth; try_catch means its try branch.
- must_contain+ string[]: Require each named statement min_count times inside the selected statement.
- min_count integer=1: Minimum count for each must_contain entry.
Use: AI calls are never made inside a loop. `{statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"]}`
Use: Database reads are never made inside a loop. `{statements: ["db.query", "db.get"], must_not_be_inside: ["foreach", "for", "while"]}`
Use: Payment writes happen inside a transaction. `{statements: ["db.add", "db.edit", "db.patch"], must_be_inside: ["db.transaction"], tables: ["payments"]}`
### statement.expression_rule: An expression follows reference and filter rules [stack]
Checks what selected statement settings may contain, such as debug logs never reading request input: required or forbidden references, operators, literals and filters. Forbid a root (`$error`, `$input`): it covers every path below it; `$error.message` misses `$error`. Write each reference with its `$`. A database or statement result is not traced: name its variable (`$token`).
- statements* string[]: Statements to inspect.
- param_names* string[]: Params to check.
- must_reference string[]: Require every listed reference.
- must_not_reference string[]: Forbid any listed reference.
- operators_forbidden string[] of ===|!==|==|!=|>=|<=|&&||||~|+|-|*|/|%|<|>: Operators to forbid.
- literals_forbidden array: Literal values to forbid.
- filters_forbidden string[]: Exact filter names to forbid, e.g. sql or to_int.
- filters_required string[]: Exact filter names to require, e.g. trim or escape.
Use: Error messages never include request input. `{statements: ["throw"], param_names: ["value"], must_not_reference: ["$input"]}`
Use: Raw SQL never joins text into the query. `{statements: ["db.direct_query"], param_names: ["sql"], operators_forbidden: ["~"]}`
Use: Datadog logs never include the logged-in user. `{statements: ["datadog.log"], param_names: ["message", "attributes"], must_not_reference: ["$auth"]}`
### statement.param_bound: A numeric parameter stays within bounds [stack]
Requires a numeric statement setting, such as a timeout or a token lifetime, to stay between a minimum and a maximum.
- statements* string[]: Statements to inspect.
- param_names* string[]: Numeric params to check.
- min+ number: Inclusive lower bound.
- max+ number: Inclusive upper bound.
- unit string: Unit label for findings, e.g. seconds.
Fix: A runtime value cannot be verified statically: bound its source or ask; do not hardcode a literal.
Use: Endpoints never return a whole table. `{statements: ["db.query"], param_names: ["per_page"], max: 1000, unit: "rows", object_kinds: ["query", "tool"]}` A list read with paging off is reported as unbounded; count and single reads are not judged.
Use: Pages hold at most 100 rows. `{statements: ["db.query"], param_names: ["per_page"], min: 1, max: 100, unit: "rows"}`
Use: Login sessions last at most a day. `{statements: ["security.create_auth_token"], param_names: ["expiration"], max: 86400, unit: "seconds"}`
### statement.param_forbidden: A parameter avoids forbidden values [stack]
Reports statement settings set to a forbidden value, such as TLS certificate checks turned off, or to a value that cannot be resolved.
- statements* string[]: Statements to inspect.
- param_names* string[]: Params to inspect.
- values* array: Forbidden literal values.
Fix: as statement.param_bound.
Use: External requests never switch off certificate checks. `{statements: ["api.request", "stream.from_request"], param_names: ["verify_peer", "verify_host"], values: [false]}`
Use: External requests don't follow redirects. `{statements: ["api.request"], param_names: ["follow_location"], values: [true]}`
### statement.param_required: Statements explicitly set a required parameter [stack]
Requires selected statement settings to be set explicitly, including in called functions and attached addons.
- statements* string[]: Statements to inspect.
- param_names* string[]: Params to require, each where a statement declares it.
- table_tags string[]: Only statements reaching a table carrying any of these tags, directly or through an attached addon; empty inspects every matching statement.
Use: Reads name the fields they return. `{statements: ["db.query", "db.get"], param_names: ["output"]}`
Use: Reads of tables tagged phi name the fields they return. `{statements: ["db.query", "db.get"], param_names: ["output"], table_tags: ["phi"]}`
### table.auth_table_rules: Endpoints use the single auth table [table, query]
Requires exactly one table to hold user logins on the branch, and every authenticated endpoint to use it, unless approved auth tables are listed.
- auth_tables string[]: Exact names of the tables allowed to be auth tables.
Fix: Which table is the auth table is the owner's decision: ask before changing table or endpoint auth to clear this. Several intentional auth tables belong in auth_tables.
Use: Users sign in through one table. `{}`
Use: Only the customer and staff tables hold logins. `{auth_tables: ["customer", "staff"]}`
### table.coverage_required: Tables are referenced by a required object [table]
Requires each selected table to be reached by an object that can run, such as a scheduled task that cleans it up.
- table_selector object{has_field, has_fk_to}: Tables in scope that need coverage; empty means every table in scope.
- referenced_by object{object_kinds, tags, statements, same_table, max_age_days, age_field}: Objects that provide coverage.
Fix: A placeholder object satisfies the check, not the policy; ask what it must do. Never rename an existing object to match a name the rule lists. How long data is kept is the owner's decision: ask before changing a cleanup task's cutoff or adding one. Write the cutoff in the delete's where as created_at < now with a literal subtract filter (now|timestamp_subtract_days:730), or a variable assigned once from now|add_secs_to_timestamp.
Use: Tables tagged retained have a cleanup task. `{tags: ["retained"], referenced_by: {object_kinds: ["task"], statements: ["db.del", "db.bulk.delete"]}}`
Use: Event logs are deleted after two years. `{tags: ["retained"], referenced_by: {object_kinds: ["task"], max_age_days: 730}}` The task's delete must bound created_at by now minus at most 730 days, written with a timestamp filter; a cutoff from $env is reported as unverifiable.
Use: The erasure function deletes from every table tagged personal. `{tags: ["personal"], referenced_by: {object_kinds: ["function"], tags: ["erasure"], statements: ["db.del", "db.bulk.delete"]}}` Tag the erasure function erasure; add db.edit or db.patch where a table is anonymised instead.
### table.field_attribute_required: Schema fields have required attributes [table]
Checks selected table fields for a required attribute or type, such as being marked sensitive, or forbids them.
- field_names+ string[]: Exact field names to select; a dotted name selects a nested field.
- field_types+ string[]: Declared field types to select, e.g. text or int.
- attribute string: Attribute to require, e.g. sensitive or visibility.
- value any=true: Required attribute value.
- type string: Declared type each selected field must have, e.g. text.
- must_exist bool=false: Also report tables in scope that don't declare the selected fields.
- forbidden bool=false: Report every selected field.
Fix: Removing or retyping a field loses data; ask first.
Use: Card numbers and security codes are never stored. `{field_names: ["card_number", "cvv"], forbidden: true}` forbidden reports every table that declares a listed field.
Use: Email fields are typed as email. `{field_names: ["email"], type: "email"}`
### table.tag_required: Tables with matching fields carry a tag [table]
Requires a tag, such as confidential, on tables that hold a selected field or, when asked, any field marked sensitive.
- field_names+ string[]: Exact field names to match; a dotted name matches a nested field.
- field_types string[]: Declared field types a named field must have, e.g. text; empty means any type.
- include_sensitive+ bool=false: Also require the tag on a table with any sensitive field.
- tag* string: Exact tag required on tables with a matching field.
Use: Tables holding a diagnosis or clinical notes are tagged phi. `{field_names: ["diagnosis", "clinical_notes"], tag: "phi"}`
Use: Tables with a sensitive field are tagged confidential. `{include_sensitive: true, tag: "confidential"}`
### table.view_hide_required: Saved views hide sensitive fields [table]
Requires every saved view of the selected tables to hide fields marked sensitive, password fields and any listed fields.
- fields string[]: More field names every saved view must hide, beyond sensitive and password fields.
Use: Saved views hide salary as well as sensitive fields. `{fields: ["salary"]}`
### table.write_location_restricted: Table writes use approved functions or tags [stack]
Restricts writes to selected tables to approved functions and tagged objects; with no approved function or tag, every write is reported.
- restricted_tables* string[]: Exact names of the tables whose writes are restricted.
- fields string[]: Restrict writes touching any listed field; empty restricts all writes.
- statements string[]: Write statement names to inspect; empty means every built-in write, including ones added later.
- allowed_functions string[]: Exact function names whose own stacks may contain the write.
- allowed_tags string[]: Permit writes in objects whose own tags, not their API group's, include any listed exact tag.
Use: Only the ledger function changes account balances. `{restricted_tables: ["accounts"], fields: ["balance"], allowed_functions: ["post_ledger_entry"]}`
Use: Audit entries are never edited or deleted. `{restricted_tables: ["audit_log"], statements: ["db.edit", "db.patch", "db.add_or_edit", "db.del", "db.truncate", "db.bulk.update", "db.bulk.patch", "db.bulk.delete"]}` With no allowed function or tag, every listed write is reported.
### test.assertion_required: Tests assert anonymous calls are rejected [query]
Requires, for each endpoint that requires a login, a test that calls it without one and asserts that it is rejected.
Fix: Add an endpoint unit test with no token expecting to_throw "Unauthorized", or a workflow test calling it with no token inside expect.to_throw "Unauthorized".
Use: Every protected endpoint has a test that an anonymous call is rejected. `{}`
### trigger.write_trigger_effects: Trigger writes account for the triggers they skip or re-fire [trigger]
Reports writes made inside a table trigger that skip another table's own triggers, or that re-fire the same trigger.
Use: Trigger writes don't skip other triggers or re-fire themselves. `{}`
### workspace.object_required: Required objects exist [workspace]
Requires objects of a selected kind to exist and be able to run: each listed name, or at least a minimum number in scope.
- object_kind* string (one object kind): Inventory kind to count.
- names string[]: Exact names that must each exist; empty counts objects instead.
- min_count integer=1: Minimum count of matching objects when names is empty.
Fix: A placeholder object satisfies the check, not the policy; ask what it must do. Never rename an existing object to match a name the rule lists.
Use: The audit_log table exists. `{object_kind: "table", names: ["audit_log"]}`
Use: A scheduled cleanup task exists and runs. `{object_kind: "task", names: ["purge_expired"]}`

## Where values go

A request about what callers, logs or vendors see is about every place a value leaves an object. Cover each one, in a `statement.expression_rule` rule per destination:
- To the caller: `throw` (`value`), `precondition` (`error`, `payload`), `util.set_header` (`value`), `api.stream` (`value`), and a function's `return` (`value`).
- To logs: `debug.log` (`value`), `datadog.log` (`message`).
- To other services: `api.request` (`url`, `params`, `headers`).

No check reads an object's `response`: say so. There is no `error` or `response` statement. An uncaught `api.request` failure reaches the caller as is: require a `try_catch` around it (`statement.containment`).

## Statement names

Write these XanoScript names in a rule, with the params checks read on each:
- External calls: api.request (url, params, headers, timeout, verify_peer, verify_host, follow_location), stream.from_request (url, timeout, verify_peer, verify_host), webflow.request (timeout), api.microservice (host, timeout), api.lambda (code, timeout), cloud.algolia.request (url), cloud.elasticsearch.request (url), cloud.aws.opensearch.request (url), db.external.postgres.direct_query (connection_string, sql), db.external.mysql.direct_query (connection_string, sql), db.external.mssql.direct_query (connection_string, sql), db.external.oracle.direct_query (connection_string, sql), db.external.snowflake.direct_query (connection_string, sql). A model called over HTTP is an api.request: judge it by host. outbound.vendor_allowlist reads every destination by kind.
- AI and LLM calls: ai.agent.run (args, allow_tool_execution), ai.external.mcp.tool.run (url, tool, args), ai.external.mcp.tool.list (url), ai.external.mcp.server_details (url). There is no prompt statement: code calls a model through an agent or over HTTP. An agent's model provider is its model_provider setting.
- Email and messaging: util.send_email (service_provider, to, subject, message), realtime.publish (channel, message, data), api.realtime_event (channel, data). util.send_email's service_provider defaults to xano; realtime statements reach your own clients.
- Database writes: db.add (data), db.add_or_edit (data), db.edit (data), db.patch, db.del, db.truncate, db.bulk.add, db.bulk.update, db.bulk.patch, db.bulk.delete, db.increment, db.direct_query (sql). The deletes are db.del, db.bulk.delete and db.truncate.
- Database reads: db.query (output, per_page, where), db.get (output), db.has, db.direct_query (sql). per_page is the page size a paged db.query applies; output is a read's field list.
- Logging: debug.log (value), datadog.log (message, attributes), datadog.log_bulk (entries).
- Auth and security: security.create_auth_token (expiration), security.jws_encode (ttl), security.jwe_encode (ttl), security.check_password, security.create_password, security.encrypt, security.decrypt, precondition (error, payload). expiration and ttl are in seconds.
- Loops and blocks: foreach, for, while, conditional, switch, group, try_catch, db.transaction. The blocks statement.containment names; loops are foreach, for and while.

## Templates

A template fits when its title, rules or words cover the request or part of it: start from it, keep its key and rules, and add only what the request asks beyond it. Read its params with `xano policy catalogue`. Only when no template covers any of the request, write a key of your own, never a template prefix such as `AUTH-` or `DATA-` with a number no template has. Fill a missing setting from the template's `examples`, else the check's `example`.
Access control:
- AUTH-010 Endpoints require login [SOC 2, HIPAA]: object.auth_required. Words: auth, login, logged in, sign in, public, anonymous, unauthenticated, token, open endpoint, protected.
- AUTH-020 Users only reach their own records [SOC 2, HIPAA]: db.where_constraint_required (needs field); db.write_from_input_forbidden (needs fields). Words: owner, own records, tenant, multi tenant, isolation, row level, idor, bola, other users data, scoped, filter by user, authorization.
- AUTH-030 Users can't make themselves admin [SOC 2, HIPAA]: db.write_from_input_forbidden. Words: mass assignment, role, admin, privilege, escalation, is_admin, overposting, self promotion, permission, user supplied.
- AUTH-003 Public endpoints can't change data: stack.statement_forbidden. Words: public, anonymous, unauthenticated, open endpoint, write, delete, modify, tamper, vandalism.
- AUTH-002 Admin endpoints check the caller's role [SOC 2, HIPAA]: object.statement_required (needs functions, and tags or paths). Words: admin, role, role check, rbac, permission, authorization, privilege, guard, staff, admin path, /admin.
- SEC-014 Login tokens expire within an hour [SOC 2, HIPAA]: statement.param_bound; statement.param_bound (needs max). Words: token, expiry, expiration, session, session length, token lifetime, ttl, jwt, login.
- BIZ-001 Endpoints check the caller before writing: stack.statement_order. Words: precondition, check before write, validate before, guard, authorization, permission, order, business rule.
- AUTH-040 Protected endpoints run your auth middleware: object.middleware_required (needs middleware). Words: middleware, auth middleware, access context, rate limit, interceptor, every request, protected.
- AUTH-050 Users sign in through one auth table: table.auth_table_rules. Words: auth table, user table, one login, identity, multiple auth, authentication table, sign in.
Data protection:
- DATA-010 Endpoints don't return personal data [SOC 2, HIPAA, GDPR, PCI DSS]: db.output_fields_forbidden (needs fields). Words: pii, personal, sensitive, leak, return, output, response, expose, privacy, gdpr, hipaa, ssn, phi, email, password.
- CONF-010 Sensitive tables are only reached by logged-in endpoints [SOC 2, HIPAA, GDPR]: object.tagged_table_access (needs table_tags). Words: pii, phi, confidential, sensitive table, tagged, hipaa, gdpr, patient, customer data, audit, access log, login.
- CONF-011 Sensitive fields are marked sensitive [SOC 2, HIPAA, GDPR, PCI DSS]: table.field_attribute_required (needs field_names). Words: sensitive, mark sensitive, pii, ssn, personal, schema, field, column, classification.
- CONF-012 Tables holding confidential data are tagged: table.tag_required (needs field_names). Words: tag, classify, classification, label, confidential, pii, phi, data inventory, untagged.
- CONF-013 Saved views hide sensitive fields [SOC 2, HIPAA]: table.view_hide_required. Words: view, saved view, hide, hidden column, sensitive, pii, dashboard, mask.
- LOG-001 Logs don't contain request, user or secret data [SOC 2, HIPAA, GDPR, PCI DSS]: statement.expression_rule. Words: log, logs, logging, debug, pii, personal, secret, leak, sensitive in logs, privacy.
- RET-001 Only the audit function writes the audit log [SOC 2, HIPAA]: workspace.object_required (needs names); table.write_location_restricted (needs restricted_tables, allowed_functions). Words: audit log, audit trail, tamper, immutable, append only, who can write, ledger, compliance, access log.
- RET-002 Retained data has a cleanup task [SOC 2, GDPR]: table.coverage_required (needs tags). Words: retention, purge, cleanup, expire, delete old, gdpr, right to erasure, scheduled task, data lifecycle.
- RET-003 Retained data is deleted after a set number of days [SOC 2, GDPR]: table.coverage_required (needs tags, referenced_by.max_age_days). Words: retention period, how long, days, age, expire after, keep for, delete after, older than, purge, cleanup, data lifecycle, storage limitation, gdpr.
Secrets:
- SEC-012 No secrets are hardcoded [SOC 2, PCI DSS]: literal.credential_shape. Words: secret, api key, password, credential, hardcoded, token, private key, aws, stripe, github, leak, encryption key.
Integrations:
- VND-001 Data only goes to approved vendors [SOC 2, HIPAA, GDPR, PCI DSS]: outbound.vendor_allowlist (needs hosts or providers). Words: vendor, third party, external, llm, openai, anthropic, ai provider, subprocessor, outbound, allowlist, whitelist, data sharing, api request.
- SEC-011 External requests verify TLS certificates [SOC 2, HIPAA, PCI DSS]: statement.param_forbidden. Words: tls, ssl, https, certificate, verify peer, insecure, man in the middle, mitm, encryption.
- LOG-010 External calls handle their own failures: statement.containment. Words: error handling, try catch, exception, failure, outage, resilience, vendor down, external call.
- SEC-013 External requests time out quickly: statement.param_bound. Words: timeout, slow, hang, stall, availability, vendor, external call, latency.
- AI-001 AI agents use only approved tools: agent.tool_allowlist (needs tools or tool_tags). Words: ai, agent, mcp, mcp server, tool, allowlist, approved tools, which tools, llm, prompt injection, excessive agency, tool access, external mcp.
Reliability:
- SEC-010 No table truncation or raw SQL: stack.statement_forbidden. Words: truncate, raw sql, direct query, sql injection, injection, destructive, delete all, dangerous, wipe, drop.
- LOG-011 Middleware doesn't swallow errors: object.settings_forbidden. Words: middleware, exception, silent, swallow exception, error handling, hidden errors, observability.
- PERF-001 Endpoints never return every row: statement.param_bound. Words: paging, pagination, per page, page size, limit, unbounded, every row, all records, large response, cost, performance, timeout, memory.
- API-010 GET endpoints only read: stack.statement_forbidden. Words: get, read only, verb, rest, safe method, write, side effect, http method.
- VAL-001 Endpoint inputs are typed and bounded: object.input_rules; object.unused_input_forbidden. Words: input, validation, type, pagination, page size, per page, unused input, email in url, path parameter.
- RET-010 Trigger writes don't silently skip other triggers or re-fire themselves: trigger.write_trigger_effects. Words: trigger, skipped trigger, audit trigger, trigger not firing, loop, infinite, recursion, recursive, async, runaway.
Testing:
- CHG-001 Endpoints are tested [SOC 2]: object.test_coverage; test.assertion_required. Words: test, tests, coverage, untested, workflow test, qa, regression, change management, assert, 401, negative test.
Conventions:
- CONV-010 Functions are snake_case: object.naming. Words: convention, naming, name, snake_case, function name, style guide, consistent names.
- CONV-011 Fields are snake_case with <table>_id links: object.naming. Words: convention, naming, snake_case, field name, column name, foreign key, relationship, table link, schema, database, table.
- CONV-012 Endpoint paths are versioned kebab-case: object.naming. Words: convention, naming, kebab-case, endpoint path, url, route, rest, api version, versioning, v1, style guide, endpoint.
- CONV-013 Function arguments are snake_case: object.naming. Words: convention, naming, snake_case, argument, parameter, input name, function input, style guide.
- CONV-020 Tags come from the agreed vocabulary: object.tag_vocabulary (needs allowed_tags). Words: convention, tag, tags, vocabulary, allowed tags, typo, consistent tags, style guide.
- CONV-021 Tags are kebab-case: object.tag_vocabulary. Words: convention, tag, tags, kebab-case, lowercase, tag style, consistent tags, style guide.
- CONV-022 APIs, functions and tasks name an owner team: object.tag_required (needs tag_set). Words: convention, tag, owner, ownership, team, owner team, untagged, style guide.
- CONV-023 Every table is classified: object.tag_required (needs tag_set). Words: convention, tag, classification, classify, data class, sensitivity, untagged, database, table.
- CONV-030 AI tools and their inputs are described: object.description_required. Words: ai, tool, agent, mcp, description, instructions, llm, documented.
- CONV-040 Endpoints and functions stay short: stack.size_limit. Words: size, long, length, big, short, thin, statements, nesting, depth, indentation, complexity, readable, refactor.
- CONV-041 Stacks nest at most 3 levels deep: stack.size_limit. Words: size, long, length, big, short, thin, statements, nesting, depth, indentation, complexity, readable, refactor.
- CONV-050 No leftover code: stack.disabled_statement_forbidden; object.unused_input_forbidden; stack.unused_variable_forbidden. Words: leftover, dead code, disabled, commented out, unused, unused input, unused variable, cleanup, tidy, hygiene.
- CONV-060 Every table has the listed fields: table.field_attribute_required (needs field_names). Words: convention, table shape, standard fields, audit columns, missing field, created_at, updated_at, deleted_at, tenant_id, timestamp, schema, column, database, table.

## Recipes

A recipe is a goal in three parts. Build is the enforcement: the objects that do the work, each by a suggested name (use one the workspace already has that does the job). Templates, one policy each in order, and Extra rules, together in one policy with a key of your own, are the coverage: `param = name` is filled from Build, `param: yours` from the user's own objects. Cannot see is the gap. For a goal a recipe covers, plan from it (How to work, step 6).
- **Protect health data** [HIPAA]: Tables holding health data are tagged and marked, reached only by logged-in callers who record each access, kept out of responses, logs and saved views, and sent only to approved vendors over verified TLS. Words: health, phi, ephi, patient, medical, clinical, diagnosis, hipaa, healthcare.
  Build:
  - tag `phi`: Added to every table holding health data and to no other: CONF-012 requires it on a table with a health field, CONF-010 a login on whatever reaches such a table, and the access-record rule selects by it.
  - field attribute `sensitive`: Set on each health field (diagnosis, dob, ssn), as CONF-011 requires; DATA-010 and CONF-013 then keep those fields out of responses and saved views.
  - table `phi_access_log`: One row per access to a health record: who ($auth.id), which record and when. RET-001 requires it and lets only log_phi_access write it.
  - function `log_phi_access`: Takes the record read and adds a phi_access_log row with db.add, the user from $auth. Every endpoint, tool and task reaching a phi table calls it unconditionally (the access-record rule).
  Templates: CONF-012 (field_names: yours; tag = phi), CONF-011 (field_names: yours), CONF-010 (table_tags = phi), DATA-010 (fields: yours), LOG-001, CONF-013, VND-001 (hosts: yours; providers: yours), SEC-011, RET-001 (names = phi_access_log; restricted_tables = phi_access_log; allowed_functions = log_phi_access).
  Extra rules: Objects reaching health tables always record the access: object.statement_required `{placement: "unconditional"}` (functions = log_phi_access; reaching_table_tags = phi).
  Cannot see: people and training; access reviews and change approvals; runtime data and copies between environments; infrastructure and network.
- **Protect payment card data** [PCI DSS]: No table stores a card number or security code, card details go only to your payment processor over verified TLS, and its keys, your logs and your responses keep card data out of sight. Words: card, credit card, payment, pan, cvv, cardholder, pci, checkout, stripe, tokenization.
  Build:
  - function `charge_card`: Charges through the payment processor with api.request, using the processor's card token and its key from $env, and stores only the token and card_last4. VND-001 holds it to the processor's hosts, SEC-012 finds no key in code, and the card-field rule no card number in any table.
  - field attribute `sensitive`: Set on the card-adjacent fields you keep (card_last4, billing_address), as CONF-011 requires; DATA-010 then keeps them out of responses.
  Templates: SEC-012, VND-001 (hosts: yours; providers: yours), SEC-011, CONF-011 (field_names: yours), DATA-010 (fields: yours), LOG-001.
  Extra rules: Card numbers and security codes are never stored: table.field_attribute_required `{field_names: ["card_number", "cvv", "cvc", "pan"], forbidden: true}`.
  Cannot see: people and training; access reviews and change approvals; runtime data and copies between environments; infrastructure and network.
- **Erase and expire personal data** [GDPR]: Tables holding personal data are cleaned up on a schedule once their rows reach your retention period and reached by one function that erases a person's records, and personal fields stay marked and out of responses and logs. Words: erasure, right to be forgotten, delete my data, retention, personal data, purge, dsar, privacy, gdpr, anonymise.
  Build:
  - function `erase_user_data`: Deletes a person's records from every personal-data table with db.del or db.bulk.delete (add db.edit or db.patch to the erasure rule where a table is anonymised instead). The erasure rule requires it to reach each table tagged personal.
  - tag `erasure`: Added to erase_user_data: the erasure rule counts only functions carrying it.
  - endpoint `account/erase`: A logged-in DELETE endpoint that calls erase_user_data for $auth.id, so a person can ask for erasure; no rule checks who calls the function.
  - tag `personal`: Added to every table holding personal data: the erasure rule requires erase_user_data to reach each one.
  - task `purge_expired_records`: Runs on a repeating schedule and deletes each retained table's rows whose created_at is older than the retention period, with db.bulk.delete (or a query, a foreach and db.del) whose where compares created_at with now minus a literal number of days. RET-003 requires an active task deleting each table tagged retained at that age or younger, so the period is never read from an environment variable.
  - tag `retained`: Added to every table whose records expire: RET-003 judges only tables carrying it.
  - field attribute `sensitive`: Set on each personal field, as CONF-011 requires; DATA-010 then keeps those fields out of responses.
  Templates: RET-003 (tags = retained; referenced_by.max_age_days: yours), CONF-011 (field_names: yours), DATA-010 (fields: yours), LOG-001.
  Extra rules: The erasure function reaches every personal-data table: table.coverage_required `{referenced_by: {object_kinds: ["function"], statements: ["db.del", "db.bulk.delete"]}}` (tags = personal; referenced_by.tags = erasure).
  Cannot see: runtime data and copies between environments; people and training.
- **Keep code easy to review**: External calls handle their failures, endpoints are tested, endpoints and functions stay short and page their reads, no leftover code remains, and functions say what they do. Naming conventions are a separate choice: see the Conventions templates. Words: code review, review, quality, clean code, maintainable, lint, best practice, tests, readable, error handling, breaking prod, juniors.
  Build:
  - tag `legacy`: Added to large legacy endpoints and functions until they are split: CONV-040 skips them through except_tags.
  Templates: LOG-010, CHG-001, CONV-040 (except_tags = legacy), CONV-050, PERF-001.
  Extra rules: Functions say what they do: object.description_required `{object_kinds: ["function"], min_length: 20}`.
  Cannot see: access reviews and change approvals; people and training.
- **Record who changed what** [SOC 2, HIPAA]: Every edit and delete of the tables you name calls one audit function, only that function writes the audit log, and nothing edits or deletes an audit entry. Words: audit, audit trail, who changed, change history, history, tamper, accountability, activity log, log changes.
  Build:
  - table `audit_log`: One row per change: who ($auth.id), the table, the record, the action and when. RET-001 requires it and lets only record_audit_event write it, and the last rule keeps every entry from being edited or deleted.
  - function `record_audit_event`: Takes the table, record id and action and adds an audit_log row with db.add, the user from $auth. Every edit, patch and delete of an audited table calls it unconditionally (the first three rules).
  Templates: RET-001 (names = audit_log; restricted_tables = audit_log; allowed_functions = record_audit_event).
  Extra rules: Edits of audited tables call the audit function: object.statement_required `{placement: "unconditional", when: {statement: "db.edit"}}` (functions = record_audit_event; when.tables: yours); Patches of audited tables call the audit function: object.statement_required `{placement: "unconditional", when: {statement: "db.patch"}}` (functions = record_audit_event; when.tables: yours); Deletes from audited tables call the audit function: object.statement_required `{placement: "unconditional", when: {statement: "db.del"}}` (functions = record_audit_event; when.tables: yours); Audit entries are never edited or deleted: table.write_location_restricted `{statements: ["db.edit", "db.patch", "db.add_or_edit", "db.del", "db.truncate", "db.bulk.update", "db.bulk.patch", "db.bulk.delete"]}` (restricted_tables = audit_log).
  Cannot see: access reviews and change approvals; runtime data and copies between environments.
- **Keep AI calls affordable and agents safe**: AI calls stay out of loops, reads are paged, agents use approved model providers and enable only approved tools, AI tools are described and cannot delete records, and deletes and emails wait for an approval check. Words: ai, llm, agent, cost, spend, tokens, mcp, tool, openai, anthropic, runaway, approval, human in the loop.
  Build:
  - table `approvals`: Who asked for an action on which record, who approved it and when; require_approval reads it, and no rule checks the table itself.
  - function `require_approval`: Looks up an approvals row for the action, approved by someone other than the requester, and stops with precondition when there is none. The approval rule requires a call to it before every delete and email.
  - tag `agent-approved`: Added to each tool the user approves for agents and MCP servers in the plan they say yes to: AI-001 accepts a tool carrying it, and reports any other tool an agent or server enables.
  Templates: VND-001 (hosts: yours; providers: yours), AI-001 (tools: yours; tool_tags = agent-approved), PERF-001, SEC-013, CONV-030.
  Extra rules: AI calls are not made inside loops: statement.containment `{statements: ["ai.agent.run", "ai.external.mcp.tool.run"], must_not_be_inside: ["foreach", "for", "while"]}`; AI tools cannot delete records: stack.statement_forbidden `{statements: ["db.del", "db.bulk.delete", "db.truncate"], object_kinds: ["tool"]}`; Deletes and emails wait for an approval check: stack.statement_order `{after: ["db.del", "db.bulk.delete", "util.send_email"]}` (before.functions = require_approval).
  Cannot see: spend caps; task retries; runtime data and copies between environments.
- **Limit how often endpoints can be called**: A rate-limit middleware runs before every public endpoint and every endpoint in your login API group, and no middleware swallows its own error, so a caller past the limit is refused. Words: rate limit, rate limiting, throttle, throttling, brute force, too many requests, 429, login attempts, abuse, bot, spam, ddos, credential stuffing.
  Build:
  - middleware `rate_limit`: Runs before the endpoint and calls redis.ratelimit keyed by the caller ($env.$remote_ip, or $auth.id once logged in) with a max per ttl window and an error past it; its exception policy is critical or rethrow, as LOG-011 requires, so the refusal reaches the caller. Both rules require it attached and active.
  - attach middleware `rate_limit`: Attached as pre middleware to the API groups holding public endpoints and to the login API group; an endpoint with its own middleware list needs it there too.
  Templates: LOG-011.
  Extra rules: Public endpoints run the rate limit first: object.middleware_required `{phase: "pre", endpoint_auth: "none", object_kinds: ["query"]}` (middleware = rate_limit); Login endpoints run the rate limit first: object.middleware_required `{phase: "pre", object_kinds: ["query"]}` (middleware = rate_limit; api_groups: yours).
  Cannot see: what a rate limit allows; infrastructure and network.
- **Keep admin endpoints for admins** [SOC 2, HIPAA]: Every admin endpoint, under the admin path or carrying the admin tag, calls one role-check function as its first statement, passing the logged-in user, and no request can write a user's role. Words: role, roles, rbac, role based access, admin only, permissions, authorization, privilege, staff only, least privilege, access control.
  Build:
  - field `role`: An enum field on the user table holding each user's role; require_role reads it, and AUTH-030 keeps any request from writing it.
  - function `require_role`: Reads the logged-in user's role (db.get on the user table by $auth.id) and stops with precondition unless it is the role passed in. AUTH-002 requires it as the first statement of every admin endpoint, referencing $auth.
  - tag `admin`: Only when the admin endpoints share no path prefix, added to the admin API group (its endpoints carry it) or to each admin endpoint, and AUTH-002 selects by it. When they share one, such as /admin, AUTH-002 selects by its paths instead and no tag is added.
  Templates: AUTH-002 (functions = require_role; tags = admin; paths: yours), AUTH-030.
  Cannot see: which roles exist and who holds them; access reviews and change approvals.

## What no check can see

- People and training: Who works on the workspace, their background checks and their security training are about people; policies read object definitions only.
- Access reviews and change approvals: Reviewing who can reach the workspace, and who approved a change, happens outside the definitions; a blocking policy can hold a merge but cannot see who signed it off.
- Runtime data and copies between environments: Policies read stored definitions, never the records in tables, what a request sent or stored, or data copied between branches, environments or tenants.
- Infrastructure and network: Hosting, network segmentation, encryption at rest, backups, vulnerability scans and penetration tests are controls of Xano or your hosting provider, not workspace definitions.
- Spend caps: No check reads what AI calls or vendors cost, or caps spend, yet; a rule can keep AI calls out of loops and reads paged.
- Task retries: Tasks have no retry setting a check could read, so how often a failed task runs again is not checked yet.
- What a rate limit allows: A check confirms the rate-limit middleware is attached and active, not the limit it sets, the key it counts by, or a caller that spreads requests across keys; those happen at run time.
- Which roles exist and who holds them: Rules confirm admin endpoints call the role check and that no request writes a role, not which roles the business needs, whether the check compares the right one, or how roles are granted and taken away.

## The `xano` CLI

You drive the official `xano` CLI from a project directory holding the workspace's objects and its policy files under `policies/`, from the project root, against the profile and branch it is pointed at. `xano policy --help` lists the policy commands and flags: read it rather than guessing. Check a file with `xano policy parse` after every edit, before you save it.

`xano workspace push` imports code and policy files together and then evaluates the branch; `xano policy evaluate` evaluates without importing. Both print the findings and the policy check's status. **Exit code 2 means a blocking finding**: an active, blocking policy failed. Any other policy outcome exits 0, and a check that could not run prints one warning line instead of changing the exit code.

`xano workspace push` asks for confirmation, and a non-interactive run refuses without `--force`, which also skips the CLI's critical-error guards. Never pass `--force` unless the user has said yes to pushing those files in this conversation (a plan's yes, How to work step 6, is that yes for exactly the files it listed): otherwise run `--dry-run`, report what would change, and stop. Policies apply to every code change, not only policy work: before changing code in a project with policy files, read the ones that apply; after, run `xano policy evaluate`.

## How to work

1. Look before you ask: run `xano workspace pull` and `xano policy list`, read the tables, endpoints, API groups, tags and functions the request touches, and say what you found.
2. Ask only what the workspace cannot tell you.
3. Read the files under `/policies/` for this workspace's conventions, including how it tags exemptions.
4. Build rules only from the catalogue. If the user names a check id that is not in it, **say that the id does not exist**, name the closest ids that do, and let them pick; never quietly write a different check.
5. Cover every part of the request a check reads and name what none reads ("What no check can see", above): checking part of it is coverage, an approximation checks something else. Write no policy only when no part is checkable. Write one policy per goal, with as many rules as it needs; from templates, one policy per template.
6. **A policy request is one plan and one yes.** Most goals have three parts: the enforcement (the object that does the work at run time: a middleware, a function and its table, a cleanup task, tags or field attributes), the coverage (the rules that keep it wired in everywhere) and the gap (what no check sees); a recipe names all three. Show ONE plan: the objects to build, the changes to existing objects (tags, field attributes, attaching middleware), the policy (its key, and each rule with the names it points at) and what stays unchecked. Reuse an object that already does the job. Build nothing before the user says yes; after one yes, build ALL of it in the same change, objects before the policy that names them. Write the object files and the policy files in the project, run `xano policy parse` on each policy and `xano workspace push --dry-run`, report what it would change, then push: the plan's yes is the yes for pushing those files. The yes covers exactly what the plan listed; anything else is asked again. Authoring is not fixing: "Fixing findings" governs every finding, also one your new policy raises on an object outside the plan.
7. On a change, change **only what was asked**. Keep the key (it is the file name: only a key change the user asks for renames the file), and leave `title`, `statement`, `tags`, `active` and `enforcement` as they are unless the request named them; propose any other edit instead. Finishing a policy handed over from Studio, or one started from a template, is a change: fill exactly what it still needs, keep every other rule, param and setting as handed over, and add no param, exemption, allowlist or rule.
8. A request about the whole policy ("skip tables tagged hr") applies to every rule it can apply to; name any rule it cannot apply to.
9. Write only names the catalogue and the workspace have. `*`, regexes and placeholders are not names, except where a param's description says so: `stack.statement_forbidden` takes a `prefix.*`, `allowed_variables` a `prefix*`, `object.naming`'s `pattern` an I-Regexp matched against the whole name (no `^`, `$`, `\d` or `\w`) and its `foreign_key_name` and `foreign_key_list_name` a `{table}`. "N statements of any kind" in a try_catch branch is that branch in `must_contain` (`["catch"]`) with `min_count: N`; statement names there require those statements.
10. A new policy whose rules (each rule's check and params) exactly match one the branch has, active or not, is refused as `policy_duplicate`, naming that policy; a push then imports nothing else either. Ask the user what the new one should cover differently: the refusal's "change a parameter or scope" is their choice, never a param or scope you pick to get past the refusal.

When the file is written, summarise the policy in plain language and why each rule applies here, anything the user asked for that no check covers, and:

- which objects each rule **should** match, from the object definitions re-read and what the check actually tests (a field's declared TYPE, a tag, a verb), not what a name suggests: a prediction, then run `xano policy evaluate` and report what it printed; say where you cannot tell.

## Honesty

**Never say you did something you have not done.** Write "I have written / changed / deleted / pushed" ONLY when the tool call that does it ran in THIS turn and came back successful. If you mean to do it next, write "I will ..." and make the call in the same turn. If a call failed, say it failed, quote what came back, and stop.

**You CAN run the policy checks.** Run `xano policy evaluate` or `xano workspace push` instead of guessing, then report ONLY what the command printed: quote the finding lines verbatim and give the exit code. Never predict a pass or a fail as an OUTCOME: before the run a prediction stays one, and if you did not run it, or it failed, say so and quote what came back.

Never say a policy makes the workspace compliant, certified or audit-ready: a pass means only that the stored definitions matched the rule when it ran. When the user names a framework, relate the policy to it ("related to SOC 2 CC6.1") and record the criterion as a tag; never claim it is satisfied.

## Fixing findings

These rules are for fixing a finding. Building what a plan the user said yes to lists is authoring (How to work, step 6), not a fix.

**Before any edit, read the policy file**: its `statement`, and the failed rule's check, params and scope. A fix changes the object the finding names so it meets the rule, and every change a fix could make is in one of three classes; a check's `Fix:` note adds detail to it and never overrides it.

- **Do it** (the user asked for a fix): the change the failed rule asks for, on the object the finding names, that leaves who may call it and every table and its data as they are: add a required statement or call, constrain a read or write by an existing field, make a flag or param explicit, drop a forbidden field from what a statement returns, replace a literal secret with an `$env` reference, add the unit test the rule asks for (the only extra object a fix may create). Then state what you changed and why, object by object, and what a caller now sees differently.
- **Ask first. STOP and ask — edit nothing until the user says yes to the exact change.** Enabling or changing an endpoint's auth or auth table (a login, signup or webhook is often public on purpose); adding, renaming, retyping or deleting a table or field, or writing, moving or deleting data; activating, deactivating or rescheduling a task or trigger; creating an object other than the required unit test; adding, removing or respelling a tag (tags decide which policies apply); removing behaviour; touching an object the findings do not name. Stop too when the rule names a field, table or tag the object lacks, or tests something the `statement` never asks for: the policy is likely scoped too wide (an empty selector or scope means everything) or lacks an exemption. Give the code changes as options, with the findings each should clear, as predictions. Picking an option is not that yes: show the exact change, then wait.
- **Never, in a fix.** Edit a policy file (a separate request, below); add a tag that exempts the object (one a policy's `except_tags` or `table.write_location_restricted`'s `allowed_tags` lists), or anything else that exempts it, such as an allowlist entry or an `allowed_secrets` fingerprint; rename, delete or retype a table or field to match a rule (tables are shared by every branch); invent a GUID, a schema or a value; work around a plan limit. **When a code change can clear a finding, list no policy edit as an option**; at most say once, briefly, that changing the policy is its owner's call. Only when no code change can clear it, offer the policy edit, last and labelled as the policy owner's decision.
- Never invent a policy's intent: its `statement` is all the intent there is. A name in a rule that matches nothing on the branch is a question for the user, not a typo to correct or a reason to rename an object.
- Order the work blocking findings first, then by severity.
- **Three objects, then STOP.** After editing three objects, END YOUR TURN: summarise what you changed, ask "shall I carry on with the next three?", and wait. Do NOT touch a fourth object before the user answers, even after "fix them all"; calling them batches changes nothing.
- **Never write a secret's value into any file**, the workspace `env` block included, or repeat any part of it in chat: not a prefix, a suffix or a masked form. Name where it is and the variable that replaces it; the user sets that variable and rotates the exposed value, so say both are still to do.
- When done, run `xano policy evaluate` (or `xano workspace push`) and report what it printed: which findings cleared, which remain, and the exit code.

**Changing the policy is a separate request.** Never edit a policy file until the user has said yes to that exact change (scope, `except_tags`, allowlists, params, severity, rules, active, enforcement, `statement`): show the exact lines, then wait; announcing a change is not approval, nor is "I own this policy". That includes repairing a rule that could not run or fails validation (an unknown or missing param): fix the error yourself only if your own edit introduced it or the policy is new in this session; if the stored rule already has it, propose the exact repair (`public_tag` → `except_tags: ["public"]`), exempting nothing new, and ask, even if you changed that rule, as it can change what the rule exempts; without a yes, save nothing and say why. Relaxing a policy (blocking to advisory, deleting a rule, loosening params, widening `except_tags`, `active = false`) is never done unprompted. When the user asks for it, do it and say it relaxes the policy: name what stops being checked, and, for a blocking policy, every gate it stops holding: a merge, a set-live, a save or push to the live branch and a tenant deploy (Xano has no pull requests). Say so when a narrowed rule would match nothing on this branch, because it then checks nothing.

**Nobody to ask?** In a non-interactive run, make only "Do it" changes and report every other finding unfixed.

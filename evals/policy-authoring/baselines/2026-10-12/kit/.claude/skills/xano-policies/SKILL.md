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
- **Write a new policy `active = true` + `advisory`**: it blocks nothing and its findings are visible. Use `active = false` only when the author wants nothing evaluated yet, and say an inactive policy never runs. On an existing policy leave both alone unless asked; before changing either, say whether it starts or stops blocking.
- **A rule cannot be named**: write `rule { ... }`, never `rule foo {`. Ids derive from position as `<KEY>.R1`, `<KEY>.R2`, and stored runs cite them, so keep existing rules in ORDER and add new ones at the end. A rule `title` is optional: give one only when the scope makes its check's label misleading.
- `severity` is the policy's, one of `critical | high | medium | low`: it orders findings and never blocks. A rule cannot carry one.
- A rule warning on your rule means it is wrong: fix it before you report.
- `params` lists ONLY the settings you set: an omitted param takes its catalogue default, so never repeat one, and omit `params` when the check needs nothing.

## Scoping a rule

Every check also accepts these scope params, which narrow the objects a rule inspects. Each is a top-level param (there is no `scope` object), all must match, and an empty or omitted list means "everything the check supports", never "nothing". Scope limits what is reported, not what is read.

- `tags` / `except_tags` (string[]): only, or all but, objects carrying any of these exact tags (an endpoint also carries its API group's tags). `except_tags` is how an exemption is expressed.
- `api_groups` (string[]): endpoints in these API groups, by exact display or canonical name.
- `verbs` (string[]): endpoints with these HTTP verbs, case-insensitive.
- `endpoint_auth` (`required` | `none`): only endpoints that require authentication, or only public ones. Xano knows which endpoints are public; never invent a tag to restate it.
- `tables` (string[]): tables by exact name, or objects that reach one directly or through a called function, an attached addon or an enabled agent/MCP tool mapping. `reaching_table_tags` (string[]): objects that reach a table carrying any of these exact tags.
- `object_kinds` (string[]): only these kinds, from those the check inspects. Object kinds: table, query, function, workflow_test, api_group, task, trigger, middleware, addon, channel, message, tool, agent, mcp_server, workspace.

`api_groups`, `verbs` and `endpoint_auth` select endpoints only.

**Scope by tag, not by name**: a renamed or deleted API group or table leaves the rule silently matching nothing; a tag travels with the object. When the user names groups or tables, use them and say so.

## The check catalogue (36 checks)

`[...]` lists the object kinds a check inspects, `*` marks a required param, `+` the params a rule must set at least one of, `=` a default. `stack` stands for the kinds that carry a statement stack: query, function, task, trigger, middleware, addon, tool, message.
### db.output_fields_forbidden: Statements do not fetch listed fields [stack]
Reports database reads and writes that fetch a listed field, or a field marked sensitive, from their table.
- fields+ string[]: Exact field names that must not be fetched; table.field restricts a name to that table.
- include_sensitive+ bool=true: Also forbid fields marked sensitive in the table schema and password-typed fields.
- table_tags string[]: Only tables carrying any of these tags are reported; empty means every table.
Fix: Remove the field from the statement's output list, or list the output explicitly without it, and say what callers stop receiving. When the object must read it (to verify a password, say), the rule does not fit that object: exempting it is the policy owner's decision, not a fix.
### db.where_constraint_required: Reads and writes constrain a required field [stack]
Requires every read and write of the selected tables to filter on a chosen field, such as the owner, optionally against a value such as the logged-in user.
- table_selector object{names, tag, has_field, has_fk_to}: Tables whose reads and writes are judged; empty means every table that has field.
- field* string: Exact field a predicate must constrain, on the statement's own table, written on either side of the operator.
- compare_to string: Reference required in the same predicate, e.g. $auth.id; empty permits any comparison on the field.
### db.write_from_input_forbidden: Writes don't take protected fields from input [stack]
Reports database writes that take a whole record, or a protected field such as a role, straight from request input.
- statements string[]: Record writes to inspect; empty means all, including ones added later.
- fields string[]: Protected field names; empty checks only whole-record assignments.
### literal.credential_shape: Definitions avoid recognizable credential literals [every kind but api_group, channel]
Reports secrets, such as API keys, tokens and private keys, written as literal values instead of environment variables.
- patterns string[] of stripe|aws|github|pem|openai|anthropic|google_api|slack|sendgrid|twilio|jwt|url_credentials|literal_keys: Built-in patterns to match; empty means all, including ones added later.
- locations string[] of definition|env|agent_settings: Where to scan: definition, env or agent_settings.
- allowed_secrets string[]: Fingerprints ("sha256:" + 64 lowercase hex) of reviewed values to skip; never the values.
Fix: Use a workspace environment variable ($env) instead of the literal; the user sets its value and rotates the exposed one, never you in a file. Never quote any part of the value, even a prefix. A value already in an environment variable is in place: change nothing, and leave narrowing the rule's locations to the owner. Allowing a value by its fingerprint (allowed_secrets) is the owner's call; never add one.
### object.auth_required: Endpoints require authentication [query, message]
Requires each endpoint and realtime message handler in scope to require a login (an auth table); a handler naming none is reported like a public endpoint.
Fix: Enabling auth changes who can call the endpoint or handler: ask first, naming the auth table you would use. If it is deliberately public (login, signup, webhook, health), exempting it (the policy's except_tags) is the policy owner's decision: propose it, never apply it.
### object.description_required: Objects, inputs and fields have descriptions [every kind but workspace]
Requires a description on each object in scope; in XanoScript the // comment lines directly above an object, an input or a field are its description.
- require_on string[] of object|input|table_field: What must have a description.
- allowed_fields string[]: Table fields that need no description, by exact name.
- min_length integer=1: Fewest characters a description must have, not counting spaces at either end.
Fix: Write a description that says what the object, input or field is for, in words its callers need, at least as long as min_length; never pad it to reach that length. For an AI tool, the text judged is its instructions (its description only when it has none), so write those. When the purpose is unclear, ask. In XanoScript, the description is the // comment lines directly above the object, input or field, not a code comment: write or edit those lines, and never add a description = line as well, which doubles it. An AI tool's own instructions are set by its instructions = line.
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
### object.middleware_required: Objects attach required middleware [query, function, task, tool, message]
Requires each named middleware to be attached and active on every object in scope, before or after the object runs as selected.
- middleware* string[]: Exact names of middleware that must be attached and active.
- phase string of any|pre|post="any": pre runs before the object's stack, post after it, any in either.
Fix: Attaching per object replaces inherited middleware; prefer the API group, channel or branch default, and ask.
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
### object.settings_forbidden: Objects avoid forbidden settings [every kind]
Reports objects whose settings have a forbidden value, such as middleware that silently swallows exceptions.
- object_kind* string (one object kind): Inventory kind to inspect.
- when* object{<setting>}: Map setting names to predicates; all must match.
### object.statement_required: Objects call a required function or statement [query, tool, task, message]
Requires each object in scope to call a given function or statement, anywhere, on every path, or as its first statement.
- statements+ string[]: Statements to require, any one of them.
- functions+ string[]: Custom functions to require a call to, any one of them.
- placement string of any|unconditional|first="any": any counts a match anywhere; unconditional one that always runs; first the first statement.
- must_reference string[]: Require every listed reference on the matching statement.
- when object{statement, tables, fields, hosts}: Only inspect objects with a statement matching every condition below; empty inspects every object in scope.
### object.tag_required: Objects carry a tag from a required set [every kind but workspace]
Requires each object in scope to carry at least one tag from tag_set, such as an owner team or a data classification.
- tag_set* string[]: The tags to choose from.
### object.tag_vocabulary: Tags follow the agreed vocabulary [every kind but workspace]
Reports tags outside the workspace's tag vocabulary, such as PII beside pii.
- allowed_tags+ string[]: Exact tags that are always accepted.
- case_style+ string of ""|snake_case|kebab-case|lowercase: A style that every tag not in allowed_tags must be written in.
- prefixes+ string[]: A tag not in allowed_tags must start with one of these, followed by at least one more character.
### object.tagged_table_access: Objects reaching tagged tables declare auth and an audit call [query, message, tool, task]
Requires every object that reaches a table carrying a sensitive-data tag to require a login and, when a function is named, to always call it, such as an audit function.
- table_tags* string[]: Exact table tags; reaching any of them puts an object in play.
- auth_tables string[]: Auth tables an endpoint or message handler must declare one of; empty accepts any.
- function string: Function the object must call unconditionally in its own stack.
### object.test_coverage: Objects are covered by a test [query, function, tool, task, middleware]
Requires each selected endpoint, function, AI tool or task to be called by a test that then asserts something.
### object.unused_input_forbidden: Declared inputs are read [query, function, tool, message, addon]
Reports inputs that an endpoint, function, AI tool, realtime message handler or addon declares but never reads.
- allowed_inputs string[]: Inputs never reported, by exact name, in every object the rule inspects.
- include_nested_inputs bool=false: On: also report fields inside object inputs that nothing reads, by dotted name (address.zip).
Fix: Removing an input changes the API contract that clients, agents and callers see. Check who sends it before deleting it, and list it in allowed_inputs if it is kept on purpose. A read that sits only in disabled code means that code was meant to use it: decide whether to restore or delete the code first.
### outbound.vendor_allowlist: Outbound calls go only to approved vendors [stack, agent]
Reports outbound requests, and cloud, email and AI model providers, that are not on the approved vendor lists.
- kinds string[] of http|cloud|email|agent.llm|db.external|lambda: Destinations to inspect; empty means all, including ones added later.
- hosts string[]: Approved hostnames, matched case-insensitively; empty reports every host as not yet reviewed.
- providers string[]: Exact provider IDs, e.g. aws, google, azure, xano, openai or anthropic; empty reports all as not yet reviewed.
- env_hosts string[]: Environment variable names approved as destinations.
- literal_urls_forbidden bool=false: Report every http and db.external destination written directly into the stack, even one hosts approves.
Fix: Approving a vendor is the policy owner's decision: report the host and ask, or ask the owner to approve the env var in env_hosts. Never add it to the allowlist yourself, and never replace a dynamic URL with a literal. A literal URL reported because literal_urls_forbidden is on moves into an environment variable: ask the owner which variable holds it, to set it in each environment, and to list it in env_hosts; never list it yourself.
### stack.disabled_statement_forbidden: Stacks hold no disabled statements [stack (no addon), workflow_test]
Reports statements switched off with disabled anywhere in an object's stack.
- allowed_statements string[]: Statements that may stay disabled, such as a debug.log a team switches on while debugging.
Fix: Delete the disabled statement once nobody needs it. Do not enable it just to clear the finding: it was switched off on purpose, and enabling it changes what the object does, so ask its owner. A statement the team switches on while debugging goes in allowed_statements.
### stack.size_limit: Stacks stay within statement and nesting limits [stack (no addon)]
Reports an object whose own stack holds more than max_statements statements or nests blocks more than max_nesting levels deep.
- max_statements+ integer: The most statements an object's stack can hold, counting the statements inside blocks.
- max_nesting+ integer: The most nesting levels a stack can reach.
Fix: Move a coherent part of the stack into a function and call it. To flatten nesting, stop early instead of wrapping the rest of the stack in another conditional: use a return, a continue inside a loop, or a precondition when the case is an error. Never disable, delete or comment out statements to get under the limit. Raising the limit or exempting the object is the policy owner's call.
### stack.statement_forbidden: Stacks exclude listed statements [stack]
Reports forbidden statements anywhere in an object's stack or in a function it calls.
- statements* string[]: Statement names to forbid.
### stack.statement_order: A statement comes before another [stack]
Requires one statement to always run before another, at any depth, such as a permission check before a database write.
- before* object{statements, functions, must_reference}: Guard required ahead of each after match.
- after* string[]: Statement names each of which must follow before.
### stack.unused_variable_forbidden: Assigned variables are read afterwards [stack (no addon), workflow_test]
Reports a value given to a variable that nothing reads afterwards. By default it judges only variables made with var or changed by a change statement: a result stored with `as` counts only when `include_results_of` lists its statement.
- include_results_of string[]: Statements whose result must be read: a variable one of them stores with as (db.query … as $users) is reported when nothing reads it.
- allowed_variables string[]: Variables never reported, by exact name (legacy_total) or by a prefix ending in * (_*).
Fix: Remove the variable, not the work. For a statement result, delete as $name and keep the statement: db.add, api.request and function.run still have to run. For a var or a change statement that nothing reads, delete that statement. A read that sits only in disabled code means that code was meant to use it: decide whether to restore or delete the code first.
### statement.containment: Statements meet nesting requirements [stack]
Requires or forbids blocks around selected statements, such as a try/catch around external requests, or requires statements nested inside them.
- statements* string[]: Statements to inspect.
- must_be_inside+ string[]: Require one of these enclosing blocks, at any depth; try_catch means its try branch.
- must_not_be_inside+ string[]: Forbid any of these enclosing blocks, at any depth; try_catch means its try branch.
- must_contain+ string[]: Require each named statement min_count times inside the selected statement.
- min_count integer=1: Minimum count for each must_contain entry.
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
### statement.param_bound: A numeric parameter stays within bounds [stack]
Requires a numeric statement setting, such as a timeout or a token lifetime, to stay between a minimum and a maximum.
- statements* string[]: Statements to inspect.
- param_names* string[]: Numeric params to check.
- min+ number: Inclusive lower bound.
- max+ number: Inclusive upper bound.
- unit string: Unit label for findings, e.g. seconds.
Fix: A runtime value cannot be verified statically: bound its source or ask; do not hardcode a literal.
### statement.param_forbidden: A parameter avoids forbidden values [stack]
Reports statement settings set to a forbidden value, such as TLS certificate checks turned off, or to a value that cannot be resolved.
- statements* string[]: Statements to inspect.
- param_names* string[]: Params to inspect.
- values* array: Forbidden literal values.
Fix: as statement.param_bound.
### statement.param_required: Statements explicitly set a required parameter [stack]
Requires selected statement settings to be set explicitly, including in called functions and attached addons.
- statements* string[]: Statements to inspect.
- param_names* string[]: Params to require, each where a statement declares it.
- table_tags string[]: Only statements reaching a table carrying any of these tags, directly or through an attached addon; empty inspects every matching statement.
### table.auth_table_rules: Endpoints use the single auth table [table, query]
Requires exactly one table to hold user logins on the branch, and every authenticated endpoint to use it, unless approved auth tables are listed.
- auth_tables string[]: Exact names of the tables allowed to be auth tables.
Fix: Which table is the auth table is the owner's decision: ask before changing table or endpoint auth to clear this. Several intentional auth tables belong in auth_tables.
### table.coverage_required: Tables are referenced by a required object [table]
Requires each selected table to be reached by an object that can run, such as a scheduled task that cleans it up.
- table_selector object{has_field, has_fk_to}: Tables in scope that need coverage; empty means every table in scope.
- referenced_by object{object_kinds, tags, statements, same_table}: Objects that provide coverage.
Fix: A placeholder object satisfies the check, not the policy; ask what it must do. Never rename an existing object to match a name the rule lists.
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
### table.tag_required: Tables with matching fields carry a tag [table]
Requires a tag, such as confidential, on tables that hold a selected field or, when asked, any field marked sensitive.
- field_names+ string[]: Exact field names to match; a dotted name matches a nested field.
- field_types string[]: Declared field types a named field must have, e.g. text; empty means any type.
- include_sensitive+ bool=false: Also require the tag on a table with any sensitive field.
- tag* string: Exact tag required on tables with a matching field.
### table.view_hide_required: Saved views hide sensitive fields [table]
Requires every saved view of the selected tables to hide fields marked sensitive, password fields and any listed fields.
- fields string[]: More field names every saved view must hide, beyond sensitive and password fields.
### table.write_location_restricted: Table writes use approved functions or tags [stack]
Restricts writes to selected tables to approved functions and tagged objects; with no approved function or tag, every write is reported.
- restricted_tables* string[]: Exact names of the tables whose writes are restricted.
- fields string[]: Restrict writes touching any listed field; empty restricts all writes.
- statements string[]: Write statement names to inspect; empty means every built-in write, including ones added later.
- allowed_functions string[]: Exact function names whose own stacks may contain the write.
- allowed_tags string[]: Permit writes in objects whose own tags, not their API group's, include any listed exact tag.
### test.assertion_required: Tests assert anonymous calls are rejected [query]
Requires, for each endpoint that requires a login, a test that calls it without one and asserts that it is rejected.
Fix: Add an endpoint unit test with no token expecting to_throw "Unauthorized", or a workflow test calling it with no token inside expect.to_throw "Unauthorized".
### trigger.write_trigger_effects: Trigger writes account for the triggers they skip or re-fire [trigger]
Reports writes made inside a table trigger that skip another table's own triggers, or that re-fire the same trigger.
### workspace.object_required: Required objects exist [workspace]
Requires objects of a selected kind to exist and be able to run: each listed name, or at least a minimum number in scope.
- object_kind* string (one object kind): Inventory kind to count.
- names string[]: Exact names that must each exist; empty counts objects instead.
- min_count integer=1: Minimum count of matching objects when names is empty.
Fix: as table.coverage_required.

## Where values go

A request about what callers, logs or vendors see is about every place a value leaves an object. Cover each one, in a `statement.expression_rule` rule per destination:
- To the caller: `throw` (`value`), `precondition` (`error`, `payload`), `util.set_header` (`value`), `api.stream` (`value`), and a function's `return` (`value`).
- To logs: `debug.log` (`value`), `datadog.log` (`message`).
- To other services: `api.request` (`url`, `params`, `headers`).

No check reads an object's `response`: say so. There is no `error` or `response` statement. An uncaught `api.request` failure reaches the caller as is: require a `try_catch` around it (`statement.containment`).

## Templates

A template fits when its title covers the request or part of it: start from it, keep its key and rules, and add only what the request asks beyond it. Read its rules with `xano policy catalogue`. Only when no title covers any of the request, write a key of your own, never a template prefix such as `AUTH-` or `DATA-` with a number no template has. Fill a missing setting from the template's `examples`, else the check's `example`.
- Access control: AUTH-010 Endpoints require login; AUTH-020 Users only reach their own records; AUTH-030 Users can't make themselves admin; AUTH-003 Public endpoints can't change data; AUTH-002 Admin endpoints check the caller's role; SEC-014 Login tokens expire within an hour; BIZ-001 Endpoints check the caller before writing; AUTH-040 Protected endpoints run your auth middleware; AUTH-050 Users sign in through one auth table
- Data protection: DATA-010 Endpoints don't return personal data; CONF-010 Sensitive tables are only reached by logged-in endpoints; CONF-011 Sensitive fields are marked sensitive; CONF-012 Tables holding confidential data are tagged; CONF-013 Saved views hide sensitive fields; LOG-001 Logs don't contain request, user or secret data; RET-001 Only the audit function writes the audit log; RET-002 Retained data has a cleanup task
- Secrets: SEC-012 No secrets are hardcoded
- Integrations: VND-001 Data only goes to approved vendors; SEC-011 External requests verify TLS certificates; LOG-010 External calls handle their own failures; SEC-013 External requests time out quickly
- Reliability: SEC-010 No table truncation or raw SQL; LOG-011 Middleware doesn't swallow errors; API-010 GET endpoints only read; VAL-001 Endpoint inputs are typed and bounded; RET-010 Trigger writes don't silently skip other triggers or re-fire themselves
- Testing: CHG-001 Endpoints are tested
- Conventions: CONV-010 Functions are snake_case; CONV-011 Fields are snake_case with <table>_id links; CONV-012 Endpoint paths are versioned kebab-case; CONV-013 Function arguments are snake_case; CONV-020 Tags come from the agreed vocabulary; CONV-021 Tags are kebab-case; CONV-022 APIs, functions and tasks name an owner team; CONV-023 Every table is classified; CONV-030 AI tools and their inputs are described; CONV-040 Endpoints stay short; CONV-041 Stacks nest at most 3 levels deep; CONV-050 No leftover code; CONV-060 Every table has the listed fields

## The `xano` CLI

You drive the official `xano` CLI from a project directory holding the workspace's objects and its policy files under `policies/`, from the project root, against the profile and branch it is pointed at. `xano policy --help` lists the policy commands and flags: read it rather than guessing. Check a file with `xano policy parse` after every edit, before you save it.

`xano workspace push` imports code and policy files together and then evaluates the branch; `xano policy evaluate` evaluates without importing. Both print the findings and the policy check's status. **Exit code 2 means a blocking finding**: an active, blocking policy failed. Any other policy outcome exits 0, and a check that could not run prints one warning line instead of changing the exit code.

`xano workspace push` asks for confirmation, and a non-interactive run refuses without `--force`, which also skips the CLI's critical-error guards. Never pass `--force` unless the user has said yes to pushing those files in this conversation: otherwise run `--dry-run`, report what would change, and stop. Policies apply to every code change, not only policy work: before changing code in a project with policy files, read the ones that apply; after, run `xano policy evaluate`.

## How to work

1. Look before you ask: run `xano workspace pull` and `xano policy list`, read the tables, endpoints, API groups, tags and functions the request touches, and say what you found.
2. Ask only what the workspace cannot tell you.
3. Read the files under `/policies/` for this workspace's conventions, including how it tags exemptions.
4. Build rules only from the catalogue. If the user names a check id that is not in it, **say that the id does not exist**, name the closest ids that do, and let them pick; never quietly write a different check.
5. Cover every part of the request a check reads and name what none reads: checking part of it is coverage, an approximation checks something else. Write no policy only when no part is checkable.
6. When a rule would need a tag, API group or table that does not exist yet, propose it separately for the user to decide, outside the policy.
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

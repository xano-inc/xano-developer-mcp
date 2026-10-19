# Policy-authoring eval

Measures how well an agent turns a customer's broad policy request into what the policy needs (decisions D40 and D41): the **enforcement** objects (a middleware, a function, a table, a task, tags and field attributes on existing objects), the **coverage** checks that keep them wired in (policy files whose rules name those objects), and an honest statement of the **gap**. Sixteen goals in a customer's voice are handed to headless Claude Code agents that see only a kit (the policies skill, the templates topic, the catalogue) and a seeded workspace. The brief has the customer approve the plan up front: the agent writes its plan to `reply.md`, then builds the objects and policy files in the pulled workspace and validates them with `xano workspace push --dry-run`. A mechanical rubric scores the build, the policies and what the agent says. Haiku at low effort is the baseline model; run it before and after each guidance change.

Not part of the npm package (`files` ships `dist/` only) and not part of `npm test`.

## Layout

| Path | What |
|---|---|
| `goals.json` | G01-G16: persona, ask, intent, specificity |
| `brief.md` | The implementer brief, rendered per goal into the agent's workdir |
| `rubric.json` | Object specs, global build and plan groups, per-goal required checks, bonus, forbidden patterns, reply checks |
| `seed/` | XanoScript for the eval workspace, exactly as `xano workspace pull` writes it (the build is diffed against it). No policies |
| `setup.mjs` | Creates or reuses the eval workspace, writes `.local/` CLI config, pushes the seed (`--reset` makes the workspace match it exactly) |
| `run.mjs` | Runs the agents and captures each build |
| `score.mjs` | Validates each build, parses each policy, applies the rubric |
| `compare.mjs` | Compares two scored labels |
| `lib/xs.mjs` | A line-based reader of pulled XanoScript for the scorer's object checks (kind, name, tags, auth, API group, middleware, fields and attributes, statements) |
| `lib/build.mjs` | Captures a run's build (runner) and validates it (scorer) |
| `lib/push-guard.mjs` | The agents' PreToolUse hook: blocks every `xano workspace push` that is not a dry run |
| `baselines/2026-10-12/kit/` | The frozen baseline kit: skill, templates topic and catalogue as served on 2026-10-12, before the D40 changes |
| `baselines/2026-10-13-d40/kit/` | The frozen D40 kit (2026-10-13): the D40 skill, templates and catalogue, before the D41 recipe changes |
| `results/<label>/` | `run.json`, `scores.json`, `summary.md`, and per run `runs/<goal>/r<n>/`: `reply.md`, `notes.json`, `meta.json`, `build/` (the files the agent added or changed in the pulled workspace, policies under `build/policies/`), `build.json` (added, modified, deleted), `build.diff`, `build_check.json` (the dry run and syntax check), `parsed.json`. `transcripts/` is gitignored |

## Setup

Needs the `xano` CLI with a profile for the instance (default: the `local` profile, `localhost:9999`), and `claude` on the PATH.

```bash
cd evals/policy-authoring
node setup.mjs                        # find or create "policy-authoring-eval", dry-run the seed push
node setup.mjs --allow-push --yes     # first time on a new workspace: enable direct push on it, push the seed
node setup.mjs --workspace 9040       # reuse a known workspace id
node setup.mjs --workspace 9040 --reset --yes   # make 9040 match seed/ exactly (also deletes what the seed lacks)
```

`setup.mjs` never uses the source profile's own workspace or workspace 1. If the instance is at its workspace limit, it creates the workspace with `tools/createWorkspace.php` in the `cloud-client-web-1` container (`--create-id`, default 9040; `--container`). It writes `.local/credentials.yaml` (profile `policy-eval`, default workspace = the eval workspace) and `.local/eval.json`; the runner and scorer point `XANO_CONFIG` at that file, so agents need no `-w`. A push writes the new workspace's GUIDs back into `seed/`; commit them only if the workspace is the shared one.

The local eval workspace is `policy-authoring-eval`, id 9040, on `localhost:9999`. Direct push is enabled on it (agents need it for `--dry-run`). After changing `seed/`, run `--reset --yes`, then pull the workspace and copy it over `seed/` so the two are byte-identical (the server normalises some forms, e.g. a whole `$input` becomes `$input[""]`); the runner refuses to start while the workspace differs from `seed/` (`--allow-drift` overrides).

## Run

```bash
node run.mjs --label 2026-10-12-baseline-haiku-low --model haiku --effort low --repeats 2 --parallel 4
node run.mjs --label after-d40-haiku-low --kit live           # pull the live skill + catalogue now
node run.mjs --label g05-sonnet --model sonnet --effort medium --goals G05,G09 --repeats 3
node run.mjs --label 2026-10-13-d40kit-build-haiku-low --kit $PWD/baselines/2026-10-13-d40/kit --repeats 3
```

Options: `--kit <dir>|live` (default the frozen baseline kit; `live` runs `xano skills pull` and `xano policy catalogue -o json` against the eval workspace once, snapshots them to `results/<label>/kit/` with the repo's `src/xanoscript_docs/policy-templates.md`), `--goals`, `--repeats`, `--parallel`, `--timeout-min` (default 20), `--max-budget-usd` (per run), `--workroot` (default `$TMPDIR/xano-policy-authoring-eval`), `--resume` (skip runs that already have `meta.json`), `--redigest` (rebuild the transcript-derived fields of existing `meta.json` files from the saved transcripts, without running agents), `--allow-drift` (run although the eval workspace differs from `seed/`).

Each run gets a fresh workdir outside the repo: `BRIEF.md`, the skill at `.claude/skills/xano-policies/SKILL.md`, `kit/policy-templates.md`, `kit/catalogue.json`, `.claude/settings.json` (the push-guard hook), an empty `out/`. The agent is `claude -p` with `--model`, `--effort`, `--setting-sources project` (no user settings, hooks or skills; the workdir's hook only), `--strict-mcp-config` (no MCP servers), tools Read/Write/Edit/Glob/Grep/Bash/Skill, `--permission-mode dontAsk`, and deny rules for the web, `curl`/`wget`, every `xano` command that changes anything (policy create/publish/delete/evaluate, workspace create/edit/delete, branch changes, profile, skills, ...) and reading the developer's checkouts or this eval. `xano workspace push` is allowed only with `--dry-run` and without `--force`: a permission rule matches by prefix and cannot tell them apart, so the PreToolUse hook `lib/push-guard.mjs` blocks any other push, wherever it sits in a compound command.

The agent pulls the workspace into `./workspace`, writes its plan to `out/reply.md`, then builds there: new objects in the folders a pull uses, edits to existing files, policies in `./workspace/policies/<KEY>.xs`. After the run, `lib/build.mjs` diffs `./workspace` against `seed/` and keeps the added and modified files in the run's `build/`, with `build.json` and a reviewable `build.diff` (deleted files are listed when the agent pulled). `meta.json` records cost, time, turns, the Bash commands, permission denials, any `xano` command outside the allowed set (`policy parse|catalogue|list`, `workspace pull`, `workspace push --dry-run`, `--help`), `push_violations` (real pushes the hook blocked), `dry_run_calls`, `plan_first` (the first write to `out/reply.md` came before the first write to `./workspace`, from the transcript's tool-call order; Bash writes are detected by a heuristic), the build counts and file access outside the workdir. The runner checks before and after the label that the eval workspace still matches `seed/` and holds no policy (`run.json` `workspace_drift_after`).

## Score

```bash
node score.mjs --label 2026-10-12-baseline-haiku-low
node score.mjs --label prototype-haiku --import <dir>   # outputs in another layout: <dir>/<GOAL>/files or <dir>/<GOAL>/r<n>/files
node score.mjs --label <label> --reparse                 # re-run xano policy parse (e.g. after a backend change)
node score.mjs --label <label> --revalidate              # re-run the build's dry run and syntax check
```

Per run, the scorer:

1. **Validates the build.** It applies `build/` to a scratch copy of `seed/` (removing deleted files) and runs `xano workspace push -d <scratch> --dry-run -o json` against the eval workspace: blocked objects (the platform's parse of a changed object failed) and unresolved references (a `function.run`, table or middleware the push and the workspace both lack) are recorded. The dry run does not parse new objects' stacks, so the XanoScript language server (`dist/lib.js` of this repo: run `npm run build` first) checks the agent's object files too; an error the seed's own copy of a changed file already has is the language server's, not the agent's, and is dropped. Cached in `build_check.json`.
2. **Reads the post-build workspace** with `lib/xs.mjs`: every object's kind, name, tags, auth, API group, attached middleware (own list, else the API group's), table fields and attributes, and stack statements with their targets. A statement's reach follows `function.run` into the functions it calls.
3. **Parses the policies** (`build/policies/*.xs`, and `*.xs` at the run's root for older labels) with `xano policy parse -o json` against the eval workspace (cached in `parsed.json`), so rule params carry their catalogue defaults. The workspace does not have the agent's objects yet, so a warning that names something the build adds (a function, middleware, table, a tag now on an object, a field) is resolved by the build and dropped; the rest count as before.
4. **Applies the rubric** and writes `scores.json` (every group's points, its aspect, the option that matched, its evidence, and for a missed or partial group the reason: what the nearest options saw) and `summary.md` (per goal: mean and per-repeat score, points by aspect, penalties, objects built and changed, whether the build validates, policies parsed, cost and time; then a per-goal check table and per-run notes with the reasons).

### What the scorer checks per goal

Every goal that is not a refusal: `build_validates` (2: dry run clean and no syntax errors; 1 with syntax errors only) and `plan_first` (1). Goals marked `build` add `plan_lists` (2: the reply names every object built or changed; 1 for half) and `plan_before_policy` (1: a built object is named before the first policy key). On top of the coverage and reply checks kept from v5:

| Goal | Enforcement | Coverage | Honesty |
|---|---|---|---|
| G04 | A new function or middleware inserts into a new table (the access log) and knows the caller (3); every endpoint reaching patients/appointments/clinical_notes calls it or has it attached (2); the three tables share a tag (1); ssn, dob and diagnosis are marked sensitive (1) | v5 rules, plus a `tagged_table_access` / `statement_required` / `middleware_required` rule naming the built recorder that resolves after the build (2) | No compliance claim; a gap named (people, access reviews, runtime data...) |
| G05 | A new function or middleware with a precondition or throw naming admin and support_lead, reading `$auth` or users (2); every admin-group endpoint runs it first or as pre middleware (2) | `role_check_first` now names the built check; tenants `org_id` rule as before | The rule checks the call, not what the function allows; the path scope |
| G09 | A new active, scheduled task deletes personal-data rows past a two-year cutoff (3); it reaches three or more personal tables (1); DELETE /account now also deletes or anonymises orders, support_tickets and the like (2) | v5 erasure and retention rules, plus a cleanup rule that resolves after the build and whose task tag the built task carries (1) | Retention age is not checked; no compliance claim |
| G10 | A new function with a precondition or throw backed by a new approvals table (2); delete_customer_note and send_customer_email call it before the delete and the email (2) | `statement_order` rules name the built check | The tool allowlist is not checkable (or an `agent.tool_allowlist` rule) |
| G14 | A new function or middleware writes audit entries into a new table with the actor (2); the endpoints writing email tables call it (2: 80%, 1: 40%) | `audit_trail` names the built writer; AI calls out of loops; email tables tagged | Spend caps and retries not checkable |
| G15 | A new middleware or function using `redis.ratelimit`, Xano's rate-limit statement (2; 1 for a hand-rolled redis or table counter that stops the request); login and signup run it before their stack (2) | `object.middleware_required` (or `statement_required`) naming it with `endpoint_auth: "none"` (3; a tag scope 2) | What the policy cannot see (limit values, bots, runtime) (2); no claim the bots are stopped (1) |
| G16 | A new manager check (2); refund approval and price change run it before writing (2); reads stay open (1); PATCH /me no longer writes the role from input (2; 1 if the reply only names the hole) | `statement_required` / `statement_order` / `middleware_required` naming it (3); `db.write_from_input_forbidden` or `table.write_location_restricted` on the role (2) | The rule checks the call, not who holds which role |

Penalties on every goal: a real push attempt (-3), deleting an existing object (-2), building or changing an object the reply never names (-1). Build goals: changing an existing object unrelated to the goal (-1). The v5 penalties (accepted unknown statement names, names the post-build workspace still lacks, unparseable policies) stand.

## Compare

```bash
node compare.mjs 2026-10-12-baseline-haiku-low after-d40-haiku-low --out results/after-d40-vs-baseline.md
```

Rescore both labels with the same rubric version first (the compare warns otherwise): `node score.mjs --label <label>` for each. The compare prints both totals, points by aspect (build, enforcement, coverage, plan, honesty), how many builds validate, how often the plan came first and any real push attempts, then per goal the mean points and the checks whose hit rate changed. Labels from before rubric v6 (policies in the run's root, no `build/`) still score, but their build, enforcement and plan groups are zero: compare them on coverage and honesty only.

## Rubric

Per goal: `required` groups (their points make the goal's max), `bonus` groups (reported beside the score, never added to it, so a nice extra cannot hide a missed core check), `forbidden` patterns (penalties), `must_refuse` for goals no policy can serve (G12, G13) and `build` for goals that need enforcement objects. Each group has a `kind`: `build`, `enforcement`, `coverage`, `plan` or `honesty`. `global.required` is added to every goal that is not a refusal, `global.build_required` to every `build` goal; `global.forbidden` applies to every goal that is not a refusal: an accepted warning that a statement name does not exist (-2), names the post-build workspace lacks (-1), a policy file that does not parse (-1); `global.forbidden_all` to every goal. Score = max(0, required - penalties).

`specs` names reusable object specs; `{"$spec": "name", ...}` anywhere in the rubric stands for that spec, with any other keys overriding it.

A group passes when any of its `any_of` options matches; an option may carry lower `points` (partial credit), and the best match counts. Matchers:

- `{"rule": {"check": "x" | [...], "params": {<path>: <constraint>}, "any_params": {...}, "resolves": true}}`: some parsed rule has the check and its params meet every constraint (paths may be dotted: `before.functions`, `referenced_by.object_kinds`). `any_params`: at least one listed constraint holds. `resolves`: the rule's scope and names select something in the post-build workspace: no unknown-name warning the build leaves standing, and any "tag is on no table/object" warning names a tag a `table.tag_required` / `object.tag_required` rule in the same run puts in place.
- Constraints: `eq`, `includes` (all), `includes_any`, `excludes_any`, `nonempty`, `empty`, `matches` (string regex), `any_matches` (some list item matches), `gte`, `lte`, `names_object` (an object spec: the value names a post-build object that meets it, e.g. `middleware: {"names_object": {"$spec": "rate_limiter_loose"}}`), `tags_object` (the value lists a tag such an object carries); a list of constraints means all of them.
- `{"object": spec}`: some post-build object meets the spec. Spec keys: `kind` (one or a list), `origin` (`new`: the build added it; `changed`: an existing object the build changed; `existing`; `any`), `name` (regex), `reach_all` / `reach_any` (statement specs every / some statement in the object's reach meets: `statement` regex on the name, `target` regex on the table/function/path or `{"new_table": true}` or `{"tables": [...]}`, `text` regex on the statement's block), `reach_distinct` (`{statement, target, min}`: that many distinct targets), `source_all` / `source_any` (regexes on the object's source, the functions it reaches and, for a function, its call sites), `auth_aware` (`$auth` appears there: the caller is known), `runs` (a task is active and scheduled).
- `{"wired": {"targets", "via", "how", "min_fraction", "min_count"}}`: existing objects (`targets`: `keys` such as `query:auth/login POST`, or `kind` plus `api_group`, `public`, `reaches_tables` and `writes`, judged on the seed's own version) are wired to an object meeting the `via` spec, in one of the `how` ways: `call` (a `function.run` of it in the reach), `call_first` (the object's first statement), `call_before:<re>` (before the first statement matching the regex), `pre_middleware` / `middleware` (attached, resolved as the runtime does from the object's own list or its API group). Passes when at least `min_fraction` (default all) of the targets are wired. Evidence names the targets not wired.
- `{"tables_tagged": {"tables", "min_fraction"}}` (the tables share a tag after the build), `{"fields_attr": {"fields": ["table.field"], "attr", "value"}}` (field attributes after the build), `{"source": {"key", "changed", "none", "all"}}` (regexes on one object's post-build source).
- `{"plan": {"check": "first" | "names_build" | "build_before_policy", "min_fraction"}}`, `{"build": {"check": "validates", "level": "clean" | "not_blocked"}}`, `{"edits": {"unrelated": [path re]} | {"deleted": true} | {"unplanned": true}}`, `{"push_violation": true}`.
- `{"tag_chain": {"check", "param", "tables_any"}}`: a rule reads tag T (e.g. `object.tagged_table_access` `table_tags`), and T is already on one of the tables, or a `table.tag_required` rule in the run puts T on one of them (by `tables`, or by `field_names` one of them has).
- `{"reply": {"all": [re], "sentence_all": [re], "none": [re]}}`: on `reply.md`. `sentence_all`: one sentence, or one line (a bullet with its bold label), matches every regex. `none`: no match, ignoring matches preceded within 40 characters by a negation ("None of this makes you compliant" passes).
- `{"no_policies": true}`, `{"any_policy": {...}}`, `{"all_policies": {...}}` (policy fields such as `enforcement`), `{"warning": re}`, `{"parse_failed": true}`, `{"policy_text": re}` (title + statement), `{"detector": "table_name_as_tag"}` (a seeded table's name used in `table_tags` / `reaching_table_tags` / `table_selector.tag` with no rule tagging it), and `all` / `any` / `not` combinators.
- `macros` (`{{NEG}}`, `{{CLAIM}}`) are substituted into regexes. All regexes are case-insensitive.

Seed facts the rubric relies on: tables `invoices`, `tenants` (with `org_id`), `patients` / `appointments` / `clinical_notes` (with `ssn`, `dob`, `diagnosis`), `payments` (card and bank fields), `customers` / `users` / `newsletter_subscribers` / `support_tickets` (email fields), `products` (price) and `refunds` (status), and singular `invoice_item`, `user_address`, `payment_method`; `users.role` admin, support_lead, manager, staff, member or viewer; functions `delete_user_account` (users, user_address, sessions only), `acme_*` and `calculateLateFee`; API groups `app` and `admin`; admin endpoints that require login but check no role; the public `auth/login`, `auth/signup`, `newsletter/subscribe` and `health` (tagged `public`) and the untagged public `invoices/export` and `appointments`; `admin/stats` in the app group; `refunds/{refund_id}/approve` and `products/{product_id}/price` with no role check, and `PATCH me` writing the whole input (role included) to the user; `api.request` to Stripe, Plaid, a shipping vendor (no timeout / 60 s / in try_catch) and an unapproved fraud vendor; credentials in a URL in `acme_notify_sms`; `ai.agent.run` inside a `foreach` in a task; an unbounded `while` retry task; a sessions-only cleanup task; an agent whose tools delete (`db.del`), email (`util.send_email`) and refund through Stripe with no approval step; two workflow tests; a disabled statement and unused variables. No audit log, audit function, role check, approval function, rate limiter or middleware: the goals that need them must build them. Change the rubric when the seed changes.

### Known weak spots

- The build's objects are read by a line-based reader, not the platform's parser: it expects the layout a pull writes (one object per file, statements on their own lines). Unusual formatting can hide a statement or an attachment; `build_check.json` and `build.diff` show what was there.
- The dry run validates only part of a build: it parses changed objects and reports unresolved references, but accepts a new object's stack unparsed. The language server fills that gap and has its own false positives (it rejects some forms the platform accepts, and filters it does not know); a changed file's pre-existing errors are discounted, a new file's are not.
- "Does the job" is structural: a recorder that inserts into a new table and sees `$auth`, a role check with a precondition naming the role, a task deleting from personal tables past a cutoff found by regex. Nothing runs the objects, so a check that always passes, or a limiter keyed by a constant, still scores.
- `plan_first` reads the order of tool calls; Bash writes are found by a heuristic. `plan_lists` and `unplanned_build` match object names (an endpoint's path or last segment) in the reply, so a reply that names an object in passing counts as planning it.
- Unrelated edits are judged per goal by path patterns, only on build goals.

- Reply checks are keyword and sentence regexes: they reward saying the right kind of thing, not saying it well. G12 and G13 `explains_why` pass almost any reply with a negation in it; G07 is judged mostly on the reply.
- Unrelated extra policies are not penalised (G04 padding with SEC-012/SEC-014 costs nothing), and a template applied as-is scores wherever its check fits.
- A rule's effect is not evaluated (no `xano policy evaluate`): a rule that parses and resolves but would report nothing useful still scores. `resolves` catches invented names and unapplied tags only.
- Single-check goals (G01, G08, G11, G12, G13) are near the ceiling once the agent can read the workspace; the headroom is in the multi-rule goals (G04, G09, G10, G14) and in G02's plural tables and G06's leftover code.
- Two repeats per goal is noisy: a single run swings G02, G05, G07 and G09 by 2-5 points.

# Policy-authoring eval

Measures how well an agent turns a customer's goal into Xano policies (decision D40). Fourteen goals in a customer's voice are handed to headless Claude Code agents that see only a kit (the policies skill, the templates topic, the catalogue), a seeded workspace they can pull and `xano policy parse`. A mechanical rubric scores what they write and say. Haiku at low effort is the baseline model; run it before and after each guidance change.

Not part of the npm package (`files` ships `dist/` only) and not part of `npm test`.

## Layout

| Path | What |
|---|---|
| `goals.json` | G01-G14: persona, ask, intent, specificity |
| `brief.md` | The implementer brief, rendered per goal into the agent's workdir |
| `rubric.json` | Per-goal required checks, bonus, forbidden patterns, reply checks |
| `seed/` | XanoScript for the eval workspace (as `xano workspace pull` writes it). No policies |
| `setup.mjs` | Creates or reuses the eval workspace, writes `.local/` CLI config, pushes the seed |
| `run.mjs` | Runs the agents |
| `score.mjs` | Parses each policy against the eval workspace and applies the rubric |
| `compare.mjs` | Compares two scored labels |
| `baselines/2026-10-12/kit/` | The frozen baseline kit: skill, templates topic and catalogue as served on 2026-10-12, before the D40 changes |
| `results/<label>/` | `run.json`, `scores.json`, `summary.md`, and per run `runs/<goal>/r<n>/` (the agent's `.xs`, `reply.md`, `notes.json`, `meta.json`, `parsed.json`). `transcripts/` is gitignored |

## Setup

Needs the `xano` CLI with a profile for the instance (default: the `local` profile, `localhost:9999`), and `claude` on the PATH.

```bash
cd evals/policy-authoring
node setup.mjs                        # find or create "policy-authoring-eval", dry-run the seed push
node setup.mjs --allow-push --yes     # first time on a new workspace: enable direct push on it, push the seed
node setup.mjs --workspace 9040       # reuse a known workspace id
```

`setup.mjs` never uses the source profile's own workspace or workspace 1. If the instance is at its workspace limit, it creates the workspace with `tools/createWorkspace.php` in the `cloud-client-web-1` container (`--create-id`, default 9040; `--container`). It writes `.local/credentials.yaml` (profile `policy-eval`, default workspace = the eval workspace) and `.local/eval.json`; the runner and scorer point `XANO_CONFIG` at that file, so agents need no `-w`. A push writes the new workspace's GUIDs back into `seed/`; commit them only if the workspace is the shared one.

The local eval workspace is `policy-authoring-eval`, id 9040, on `localhost:9999`.

## Run

```bash
node run.mjs --label 2026-10-12-baseline-haiku-low --model haiku --effort low --repeats 2 --parallel 4
node run.mjs --label after-d40-haiku-low --kit live           # pull the live skill + catalogue now
node run.mjs --label g05-sonnet --model sonnet --effort medium --goals G05,G09 --repeats 3
```

Options: `--kit <dir>|live` (default the frozen baseline kit; `live` runs `xano skills pull` and `xano policy catalogue -o json` against the eval workspace once, snapshots them to `results/<label>/kit/` with the repo's `src/xanoscript_docs/policy-templates.md`), `--goals`, `--repeats`, `--parallel`, `--timeout-min` (default 20), `--max-budget-usd` (per run), `--workroot` (default `$TMPDIR/xano-policy-authoring-eval`), `--resume` (skip runs that already have `meta.json`), `--redigest` (rebuild the transcript-derived fields of existing `meta.json` files from the saved transcripts, without running agents).

Each run gets a fresh workdir outside the repo: `BRIEF.md`, the skill at `.claude/skills/xano-policies/SKILL.md`, `kit/policy-templates.md`, `kit/catalogue.json`, an empty `out/`. The agent is `claude -p` with `--model`, `--effort`, `--setting-sources project` (no user settings, hooks or skills), `--strict-mcp-config` (no MCP servers), tools Read/Write/Edit/Glob/Grep/Bash/Skill, `--permission-mode dontAsk`, and deny rules for the web, `curl`/`wget`, every `xano` command that changes anything (policy create/publish/delete/evaluate, workspace push/create/edit/delete, branch changes, profile, skills, ...) and reading the developer's checkouts or this eval. `meta.json` records cost, time, turns, the Bash commands, permission denials, any `xano` command outside the allowed set (`policy parse|catalogue|list`, `workspace pull`, `--help`) and file access outside the workdir.

## Score

```bash
node score.mjs --label 2026-10-12-baseline-haiku-low
node score.mjs --label prototype-haiku --import <dir>   # outputs in another layout: <dir>/<GOAL>/files or <dir>/<GOAL>/r<n>/files
node score.mjs --label <label> --reparse                 # re-run xano policy parse (e.g. after a backend change)
```

The scorer parses every `.xs` the agent left in `out/` with `xano policy parse -o json` against the eval workspace (cached in `parsed.json`), so rule params carry their catalogue defaults and the platform's own warnings name unknown tables, functions, statements and untagged scopes. It writes `scores.json` (every group's points, the option that matched, evidence) and `summary.md` (per-goal mean and per-repeat scores, parse-clean counts, unknown-name warnings, refusals, the agent's own confidence, cost and time; then a per-goal check table with reasons).

## Compare

```bash
node compare.mjs 2026-10-12-baseline-haiku-low after-d40-haiku-low --out results/after-d40-vs-baseline.md
```

Rescore both labels with the same rubric version first (the compare warns otherwise).

## Rubric

Per goal: `required` groups (their points make the goal's max), `bonus` groups (reported beside the score, never added to it, so a nice extra cannot hide a missed core check), `forbidden` patterns (penalties), and `must_refuse` for goals no policy can serve (G12, G13). `global.forbidden` applies to every goal that is not a refusal: an accepted warning that a statement name does not exist (-2), names the workspace lacks (-1), a policy file that does not parse (-1). Score = max(0, required - penalties).

A group passes when any of its `any_of` options matches; an option may carry lower `points` (partial credit), and the best match counts. Matchers:

- `{"rule": {"check": "x" | [...], "params": {<path>: <constraint>}, "any_params": {...}, "resolves": true}}`: some parsed rule has the check and its params meet every constraint (paths may be dotted: `before.functions`, `referenced_by.object_kinds`). `any_params`: at least one listed constraint holds. `resolves`: the rule's scope and names select something in the seeded workspace: no unknown-name warning, and any "tag is on no table/object" warning names a tag a `table.tag_required` / `object.tag_required` rule in the same run puts in place.
- Constraints: `eq`, `includes` (all), `includes_any`, `excludes_any`, `nonempty`, `empty`, `matches` (string regex), `any_matches` (some list item matches), `gte`, `lte`; a list of constraints means all of them.
- `{"tag_chain": {"check", "param", "tables_any"}}`: a rule reads tag T (e.g. `object.tagged_table_access` `table_tags`), and T is already on one of the tables, or a `table.tag_required` rule in the run puts T on one of them (by `tables`, or by `field_names` one of them has).
- `{"reply": {"all": [re], "sentence_all": [re], "none": [re]}}`: on `reply.md`. `sentence_all`: one sentence, or one line (a bullet with its bold label), matches every regex. `none`: no match, ignoring matches preceded within 40 characters by a negation ("None of this makes you compliant" passes).
- `{"no_policies": true}`, `{"any_policy": {...}}`, `{"all_policies": {...}}` (policy fields such as `enforcement`), `{"warning": re}`, `{"parse_failed": true}`, `{"policy_text": re}` (title + statement), `{"detector": "table_name_as_tag"}` (a seeded table's name used in `table_tags` / `reaching_table_tags` / `table_selector.tag` with no rule tagging it), and `all` / `any` / `not` combinators.
- `macros` (`{{NEG}}`, `{{CLAIM}}`) are substituted into regexes. All regexes are case-insensitive.

Seed facts the rubric relies on: tables `invoices`, `tenants` (with `org_id`), `patients` / `appointments` / `clinical_notes` (with `ssn`, `dob`, `diagnosis`), `payments` (card and bank fields), `customers` / `users` / `newsletter_subscribers` / `support_tickets` (email fields), `audit_log`, and singular `invoice_item`, `user_address`, `payment_method`; functions `check_admin_role`, `record_audit_event`, `delete_user_account`, `request_human_approval`, `acme_*` and `calculateLateFee`; API groups `app` and `admin`; the public `invoices/export` and `appointments` endpoints; `admin/stats` in the app group; `api.request` to Stripe, Plaid, a shipping vendor (no timeout / 60 s / in try_catch) and an unapproved fraud vendor; credentials in a URL in `acme_notify_sms`; `ai.agent.run` inside a `foreach` in a task; an unbounded `while` retry task; a sessions-only cleanup task; an agent whose tools delete (`db.del`) and email (`util.send_email`); two workflow tests; a disabled statement and unused variables. Change the rubric when the seed changes.

### Known weak spots

- Reply checks are keyword and sentence regexes: they reward saying the right kind of thing, not saying it well. G12 and G13 `explains_why` pass almost any reply with a negation in it; G07 is judged mostly on the reply.
- Unrelated extra policies are not penalised (G04 padding with SEC-012/SEC-014 costs nothing), and a template applied as-is scores wherever its check fits.
- A rule's effect is not evaluated (no `xano policy evaluate`): a rule that parses and resolves but would report nothing useful still scores. `resolves` catches invented names and unapplied tags only.
- Single-check goals (G01, G08, G11, G12, G13) are near the ceiling once the agent can read the workspace; the headroom is in the multi-rule goals (G04, G09, G10, G14) and in G02's plural tables and G06's leftover code.
- Two repeats per goal is noisy: a single run swings G02, G05, G07 and G09 by 2-5 points.

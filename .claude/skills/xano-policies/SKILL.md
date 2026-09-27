---
name: xano-policies
description: Use this skill whenever working with Xano workspace policies - authoring or editing policy files (`policies/*.xs`, `policy "KEY" { ... }` documents), running or interpreting policy checks, findings, reports or status, using any `xano policy ...` command, reading `policy_check` feedback from `xano workspace push`, or answering which checks exist, what a check inspects and how to fix or exempt a finding. Trigger on any mention of a Xano policy, policy check, policy finding, policy run or the policy catalogue, and before changing code in a project that has a `policies/` folder: its active mandatory policies apply to every code change.
---

# Xano policies

## Get the live version of this skill

**This file is a stub.** The authoritative skill is generated on the Xano instance from
its live check catalogue at request time, so only the instance knows which checks exist
and exactly what parameters they accept.

Install it into this project:

```bash
xano profile use <name> -w <workspace_id> -b <branch>   # once, if no profile is selected
xano skills pull                                        # writes .claude/skills/xano-policies/SKILL.md
```

`xano skills pull` writes the generated skill to `.claude/skills/xano-policies/SKILL.md`
under the project directory. That replaces this stub only when the stub was installed into
the project for Claude Code, without `-g`:

```bash
npx skills add xano-inc/xano-developer-mcp -s xano-policies -a claude-code
```

A stub installed globally or for another agent stays where that agent reads it, so remove
it after pulling. **If the file you are reading already has a "check catalogue" section,
you are reading the live version**: follow it and ignore this stub. Until then, never
guess a check id or parameter; read them from `xano policy catalogue`.

## The rules that never change

- **Policy source carries no comments.** `//` and `/* */` are refused outright, `#` is a
  syntax error. The explanation belongs in `statement`, `rationale`, `narrative`, or a
  rule's `title`.
- **Rules are anonymous.** Write `rule { ... }`; `rule foo { ... }` is refused. A rule's
  id is its position (`KEY.R1`, `KEY.R2`), and its human name is its `title`.
- **A rule has no `severity`.** Severity lives on the policy (`critical`, `high`,
  `medium`, `low`) and only orders findings; `enforcement` is what blocks a merge.
- **There is no `owner` field.** An `owner` line is refused.
- **A new policy is `active = true` with `enforcement = "advisory"`** unless you
  are told otherwise: it blocks nothing while its findings are reviewed, and an inactive
  policy (`active = false`) is never evaluated, so it reports nothing at all.
- **Always parse before publishing:** `xano policy parse --file <path>`, then
  `xano policy publish --file <path> -m "<message>"`.
- **Never weaken a policy unprompted** — mandatory to advisory, loosening or removing a
  rule, widening `except_tags`, or moving it to `draft`. Fix the object instead, and when
  you are asked to weaken one, say plainly what stops being checked.
- **A fix changes the object, never the policy, and never exempts it.** Do the change the
  failed rule asks for when it leaves who may call the object and every table and its data
  as they are. Ask first before enabling auth, touching a table, field or data, adding or
  removing a tag, rescheduling a task, or creating an object other than the unit test the
  rule asks for. Never add a tag a policy's `except_tags` lists, an
  allowlist entry or an `allowed_secrets` fingerprint, and never rename a table to match a
  rule, or work around a plan limit. Never quote any part of a secret.
- **Policies apply to every code change.** In a project with a `policies/` folder, read the
  active policies that apply to what you are changing, keep to the mandatory ones, and run
  `xano policy evaluate` after changing code (exit 2 is a blocking finding).

## Commands

- `xano policy catalogue [--check <id>]` — the checks this instance actually has, with their parameter schemas.
- `xano policy parse <file>` — validate and format on the instance; writes nothing.
- `xano policy publish --file <path> -m "<message>"` — create or update by the policy's stable key.
- `xano policy evaluate [--summary]` — evaluate active policies and store a run; exit 2 when an active mandatory policy has findings. `--summary` answers the run's counts and verdicts with its first 50 findings.
- `xano policy status [--run-detail]` — stored policy/run state without evaluating; `--run-detail` prints what the latest run recorded.
- `xano policy runs [run_id]` — the runs the branch retains (newest twenty), newest first; with an id, that run and one page of its findings (`--offset`, `--limit`, and filters such as `--blocking`, `--policy`, `--severity`).
- `xano workspace push` — imports and then returns `policy_check`, listing the first 100 findings (`xano policy runs <run_id>` has them all); exit 2 means the import succeeded and an active mandatory policy has findings, not a rollback. Feedback that could not be produced is one warning line, not an exit code.

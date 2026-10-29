---
name: xano-policies
description: Use this skill whenever working with Xano workspace policies - authoring or editing policy files (`policies/*.xs`, `policy "KEY" { ... }` documents), running or interpreting policy checks, findings, reports or status, using any `xano policy ...` command, reading `policy_check` feedback from `xano workspace push`, or answering which checks exist, what a check inspects and how to fix or exempt a finding. Trigger on any mention of a Xano policy, policy check, policy finding, policy run or the policy catalogue, and before changing code in a project that has a `policies/` folder: its Block policies apply to every code change.
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

- **The file name is the key.** A policy lives at `policies/<KEY>.xs`, and Studio refuses to
  publish a policy file named otherwise. Never change a policy's key unless the user asks, and
  when they do, change the header and rename the file to the new key together. Never move or
  copy a policy to a file named anything other than its key; if asked to, explain that the file
  name is the key and offer a key change instead.
- **Policy source carries no comments.** `//` and `/* */` are refused outright, `#` is a
  syntax error. The explanation belongs in `statement`, `rationale`, `narrative`, or a
  rule's `title`.
- **Rules are anonymous.** Write `rule { ... }`; `rule foo { ... }` is refused. A rule's
  id is its position (`KEY.R1`, `KEY.R2`), and its human name is its `title`.
- **A rule has no `severity`.** Severity lives on the policy (`critical`, `high`,
  `medium`, `low`) and only orders findings; `enforcement` is what blocks a gate.
- **There is no `owner` field.** An `owner` line is refused.
- **A new policy is `enforcement = "warn"`** unless you are told otherwise: it blocks
  nothing while its findings are reviewed. `enforcement` is `"off"`, `"warn"` or `"block"`
  (Off: not checked; Warn: reports problems and stops nothing; Block: stops a publish, merge or
  set live that adds a new problem or changes an object that already has one, and a tenant
  deploy with any problem, unless someone allowed to override gives a reason). The old words are
  refused, and so are the retired `active` and `lifecycle` fields.
- **Start a new policy from a template when one fits.** `xano policy catalogue` lists the
  platform's templates (`topic: "policy-templates"` in the XanoScript docs lists them too), and
  `xano policy create --template <id> --param 'path=JSON'` creates one and records it on the
  policy (`template = "<id>"`, written after `enforcement`). Each template names the settings it
  leaves to fill, with an example value that fits (`examples`, else the check's own `example`);
  fill them with the workspace's own names. Keep the template's rules and let the platform name
  the policy from the template; invent a key only when no template covers the request.
- **Every exception carries its reason.** An exception list (`except_tags`, `except_paths`, a
  check's `allowed_*` list) takes `{value: "public", reason: "why it is allowed"}` entries, and
  `except_objects` takes `{kind, guid, name, reason}` for one object, by its guid; the platform
  stamps who added it and when. A bare string or a blank reason is refused.
- **Always parse before publishing:** `xano policy parse --file <path>`, then
  `xano policy publish --file <path> -m "<message>"`.
- **An exact copy is refused.** A new policy whose template and rules exactly match one the
  branch already has (`off` or not) is refused as `policy_duplicate`, naming that policy. Only
  the template and each rule's check and params count, in any order, an exception list by its
  values; the key, title, statement, tags, severity, enforcement, exception reasons and rule
  titles do not. Tell the user which policy has
  these rules and ask what the new one should cover differently: the refusal's "change a
  parameter or scope" is their choice, never a param or scope you pick to get past the
  refusal. On a push, nothing else in it is imported either.
- **Never relax a policy unprompted** — Block to Warn, loosening or removing a rule,
  adding an exception (an `except_tags` or `except_objects` entry, an allowlist entry), or
  setting `enforcement = "off"`. Fix the object instead, and when
  you are asked to relax one, say plainly what stops being checked. Never override a policy
  gate's refusal unless the user gave you the reason.
- **A fix changes the object, never the policy, and never exempts it.** Do the change the
  failed rule asks for when it leaves who may call the object and every table and its data
  as they are. Ask first before enabling auth, touching a table, field or data, adding or
  removing a tag, rescheduling a task, or creating an object other than the unit test the
  rule asks for. Never add a tag a policy's `except_tags` lists, an object exception, an
  allowlist entry or an `allowed_secrets` fingerprint, and never rename a table to match a
  rule, or work around a plan limit. Never quote any part of a secret.
- **Policies apply to every code change.** In a project with a `policies/` folder, read the
  policies that are on (not `off`) and apply to what you are changing, keep to the Block ones, and run
  `xano policy evaluate` after changing code (exit 2 is a Block finding).

Every command: `xano policy --help`, or the live skill after `xano skills pull`.

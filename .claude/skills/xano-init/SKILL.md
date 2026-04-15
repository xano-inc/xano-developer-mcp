---
name: xano-init
description: Discover and profile a Xano workspace to understand how to develop safely with it using the sandbox workflow
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent, mcp__xano-developer__meta_api_docs, mcp__xano-developer__cli_docs, mcp__xano-developer__xanoscript_docs, mcp__xano-developer__validate_xanoscript, mcp__xano-developer__mcp_version, WebFetch, ToolSearch, AskUserQuestion]
---

# Xano Workspace Init

You are running an interactive setup process to understand how to safely and effectively develop against a Xano workspace. Your goal is NOT to catalog the workspace contents — that's available elsewhere. Your goal is to understand the **development workflow, constraints, and environment** so you can work within them.

**The sandbox workflow is the default and recommended way to deploy changes.** Unlike `workspace push` which pushes directly to a branch (where schema changes hit the real database immediately), the sandbox is a fully isolated environment. Nothing touches the real workspace until you explicitly review and promote changes. This is a core safety principle that should guide everything in this setup.

This is a guided, conversational process. Ask questions, validate answers, and build up a development playbook.

---

## Phase 1: Environment Check (automated)

Run these checks silently before asking the user anything. Gather all results in parallel, then present a status summary.

### Package reference (for version comparisons)
- **Xano CLI** npm package: `@xano/cli` — install: `npm install -g @xano/cli`
- **Xano Developer MCP** npm package: `@xano/developer-mcp` — install: `claude mcp add xano -- npx -y @xano/developer-mcp`

### 1a. MCP Availability & Version
- Use `ToolSearch` to check if `mcp__xano-developer__mcp_version` is available
- If available, call it to get the installed version
- Run `npm view @xano/developer-mcp version` to get the latest published version
- Compare: if installed < latest, flag as outdated

### 1b. CLI Installation & Version
- Run `xano --version` (global install) to check if the CLI is installed and get the version
- Run `npm view @xano/cli version` to get the latest published version
- Compare: if installed < latest, flag as outdated
- If `xano` is not found globally, try `npx xano --version` as fallback (but note this doesn't mean it's properly installed)
- Run `xano sandbox --help` to verify sandbox commands are available. If the command is not recognized, the CLI is too old and must be updated.

### 1c. Auth State
- Run `xano profile token` (suppress output, only check exit code) to detect if there's an active session
- Run `xano profile me` to get the user name, email, and instance URL
- Do NOT display the token to the user

### 1d. Local Project State
- Check if there's already a `xano/` folder in the project
- Check if `.claude/xano-workspace-profile.md` already exists (previous init)
- Check if `CLAUDE.md` already references Xano configuration
- Check for any `.xs` files in the project

### 1e. Present Environment Status

Show the user a clear status table with version details:

```
## Environment Status

| Check              | Status |
|--------------------|--------|
| Xano MCP tools     | ✅ Up to date (v1.0.61) / ⚠️ Outdated (v1.0.58 → v1.0.61 available) / ❌ Not installed |
| Xano CLI           | ✅ Up to date (v0.0.94) / ⚠️ Outdated (v0.0.90 → v0.0.94 available) / ❌ Not installed |
| Sandbox support    | ✅ Available / ❌ Not available (CLI update required) |
| Auth session       | ✅ [User Name] (instance.xano.io) / ❌ Not authenticated |
| Local xano/ folder | ✅ Found (X .xs files) / ⚠️ Not found |
| Previous init      | ✅ Profile exists / ➖ Fresh setup |
```

### 1f. Fix missing or outdated tools BEFORE continuing

If any critical tool is missing or outdated, stop and provide the exact fix. Do not proceed to Phase 2 until the user confirms they've resolved it.

**MCP not installed:**
```bash
claude mcp add xano -- npx -y @xano/developer-mcp
# Restart Claude Code after running this for MCP tools to load
```

**MCP outdated** (only applies if installed globally, not via npx which auto-fetches latest):
```bash
npm update -g @xano/developer-mcp
```

**CLI not installed:**
```bash
npm install -g @xano/cli
```

**CLI outdated or sandbox commands not available:**
```bash
xano update
# or: npm install -g @xano/cli
```
The sandbox workflow (`xano sandbox *`) is the recommended safe deployment method. If sandbox commands are not recognized after updating, the user's CLI may need a fresh install: `npm install -g @xano/cli`.

**Not authenticated:**
```bash
xano auth   # opens browser for OAuth login
```

Critical = no CLI (sandbox workflow requires it), or no auth (can't do anything without it), or no sandbox support (CLI too old — must update).

If MCP is missing but CLI is installed with sandbox support, note it and continue — CLI covers most operations. Recommend installing MCP for full capabilities (docs, validation).

If a previous init exists, ask: **"I found an existing workspace profile. Do you want to update it or start fresh?"**

---

## Phase 2: Interactive Setup (guided Q&A)

Ask these questions conversationally — don't dump them all at once. Group related questions together and adapt based on answers. Use `AskUserQuestion` for each group.

### 2a. Workspace Selection

List available workspaces (via CLI `xano workspace:list` or Meta API) and ask:

> **Which workspace are we working with?**

If only one exists, confirm it. If they've already specified one (e.g., in args), use that.

Once selected, fetch basic workspace info (name, ID, instance URL) and the branch list. You need branches to ask the next questions.

### 2b. CLI Profile Setup

Sandbox commands (`xano sandbox *`) inherit the workspace and branch from the CLI profile — they do **not** accept `-w` or `-b` flags. Setting up a dedicated profile is essential for the sandbox workflow to target the correct workspace and branch.

1. Run `xano profile list` to see existing profiles
2. Check if any profile already targets this workspace (match by workspace ID)
3. If a suitable profile exists, confirm with the user: **"I see profile `[name]` targeting workspace [id]. Should I use this, or create a new one?"**
4. If the branch isn't set or is wrong on the existing profile, update it: `xano profile edit [name] -b [dev-branch]`
5. If no suitable profile exists, create one:
   ```bash
   xano profile create [workspace-name-slug] -i [instance-url] -t $(xano profile token) -w [workspace-id] -b [dev-branch]
   ```
6. Store the profile name — it will be used with `-p [profile]` for all subsequent CLI commands in the playbook.

**Important:** If the user's default profile already targets this workspace and branch, a dedicated profile isn't strictly necessary, but is still recommended for clarity — especially if they work across multiple workspaces.

### 2c. App Status & Stage

> **What's the current status of this app?**
> - 🚧 In active development (not yet live)
> - 🟡 Staging/testing (has users but not fully launched)
> - 🟢 Production (live with real users/data)
> - 🔀 Mix (e.g., live but still adding major features)

This determines how cautious development rules need to be.

### 2d. Branching & Deployment

Present what you found from the branch list, then ask:

> **Here's what I see for branches: [list branches with live status]**
>
> - Which branch should I develop on?
> - Are there any branches I should NEVER touch?

Then present the deployment method choice. Lead with the sandbox recommendation:

> For deploying changes, the **recommended approach is the sandbox workflow**: push changes to an isolated sandbox environment, review them in the browser, then promote to your development branch. The sandbox is fully isolated — nothing touches your real workspace or database until you explicitly promote.
>
> The alternative is `workspace push`, which pushes directly to a branch. Be aware: **schema changes (table modifications) take effect on the real database immediately**, even on a dev branch. This is why `workspace push` is disabled by default on Xano workspaces (`allow_push` must be explicitly enabled).
>
> Which approach do you prefer?
> - **Sandbox workflow** (recommended — fully isolated, safe by default)
> - **Direct workspace push** (faster iteration but riskier — requires enabling `allow_push` in workspace settings)
> - **Something else** (CI/CD, manual in dashboard, etc.)

If the user chooses workspace push, explain the risks clearly and confirm they understand. If they choose sandbox (or don't express a preference), proceed with sandbox as the default.

### 2e. Team & Collaboration

> **Who works on the Xano backend?**
> - Just me
> - Small team (2-5 people)
> - Larger team with defined roles
>
> Are there any conventions I should follow? (naming, code style, PR process, etc.)

### 2f. Development Boundaries

> **Are there any no-go zones I should know about?**
> - Tables I should never modify the schema of?
> - Endpoints or functions I shouldn't touch?
> - Environment variables that are sensitive or shouldn't be changed?
> - Any integrations (webhooks, third-party services) I should be careful around?

### 2g. Data Sources

> **Do you use separate data sources for test vs. live data?**
> - If yes: which data source should I use during development?
> - If no: should I be careful about modifying data directly?

### 2h. Editing & Validation Preferences

This question focuses on **how to author code**, not how to deploy it (that was covered in 2d).

> **How would you like me to author and edit Xano code?**
> - Edit .xs files locally (pull → edit → push to sandbox)
> - Via MCP tools for quick inline changes
> - Some combination
>
> Should I always validate XanoScript before pushing to sandbox?

If the user chose sandbox in 2d, the deployment workflow is already established — don't re-ask about it here.

---

## Phase 3: Workflow Validation (test that it works)

Run quick smoke tests to confirm the development workflow actually functions. Do these in parallel where possible.

### 3a. Validate XanoScript
If there are existing `.xs` files, pick one and run `mcp__xano-developer__validate_xanoscript` to confirm validation works.

### 3b. Test Deployment Access
Make a read-only Meta API call (e.g., list API groups) to confirm the auth token and instance URL work for the workspace.

### 3c. Test Branch Access
If the user specified a development branch, confirm it exists and is accessible.

### 3d. Test Sandbox Access
If the user chose the sandbox workflow (the default):
- Run `xano sandbox get -p [profile]` to create or retrieve the sandbox environment
- Verify it returns successfully with state "ok"
- If it fails, troubleshoot: check the profile has the correct workspace ID and branch, check CLI version

If the user opted for workspace push instead:
- Run `xano workspace get [workspace-id]` and check if `Allow Push` is enabled
- If disabled, inform the user: "Workspace push is disabled by default. You can enable it in your workspace settings in the Xano dashboard, or I can help you enable it. However, the sandbox workflow avoids this requirement entirely and is safer."

### 3e. Report Validation Results

```
## Workflow Validation

| Test                    | Result |
|-------------------------|--------|
| XanoScript validation   | ✅ Working / ⚠️ No .xs files to test / ❌ Failed |
| Meta API access         | ✅ Connected / ❌ Auth error |
| Dev branch access       | ✅ Confirmed / ➖ N/A (single branch) |
| Sandbox environment     | ✅ Provisioned / ❌ Failed / ➖ N/A (using workspace push) |
| CLI profile             | ✅ [profile] → workspace [id], branch [branch] |
```

If anything fails, troubleshoot with the user before proceeding.

---

## Phase 4: Generate Development Playbook

Based on everything gathered, create a focused **development playbook** at `.claude/xano-workspace-profile.md`. This is NOT an architecture document — it's a set of operating instructions for how to develop safely.

```markdown
---
workspace: [Name]
workspace_id: [ID]
instance: [subdomain.xano.io]
cli_profile: [profile-name]
generated: [ISO date]
---

# Xano Development Playbook: [Workspace Name]

## Quick Reference

| Key | Value |
|-----|-------|
| Workspace ID | [id] |
| Instance | [url] |
| CLI Profile | [profile-name] (use `-p [profile-name]` with all CLI commands) |
| App Status | [Development / Staging / Production] |
| Dev Branch | [branch name or "main/v1"] |
| Live Branch | [branch name or "same as dev"] |
| Deploy Method | Sandbox (recommended) / [Workspace Push / Manual — only if user chose] |
| Workspace Push | [Enabled / Disabled (default)] |
| Data Source | [test / live / single] |

## Development Rules

[Generate 5-10 clear, specific rules based on the user's answers. These should be imperative statements. Lead with sandbox safety rules. Examples:]

1. Always deploy via sandbox: `sandbox push` → `sandbox review` → promote. Never push directly to workspace.
2. Always work on the `dev` branch — never modify the live branch directly
3. Always use `-p [profile]` with CLI commands to target the correct workspace and branch
4. Validate all XanoScript with `validate_xanoscript` before pushing to sandbox
5. Never modify the `user` or `account` table schemas — they're in production
6. Run `sandbox unit_test run_all` before promoting changes
7. If sandbox gets into a bad state, reset with `sandbox reset -p [profile] -f`
8. [etc. — based on actual user answers]

If the user opted for workspace push instead of sandbox, adjust rules accordingly but include a clear warning about schema changes hitting the real database.

## How to Deploy Changes

### Sandbox Workflow (default)

#### Editing an existing endpoint or function
1. Pull workspace locally: `xano workspace pull ./xano -p [profile] -b [dev-branch]`
2. Edit the relevant `.xs` files
3. Validate: use `validate_xanoscript` MCP tool
4. Push to sandbox: `xano sandbox push ./xano -p [profile]`
5. Run tests in sandbox: `xano sandbox unit_test run_all -p [profile]`
6. Review in browser: `xano sandbox review -p [profile]`
7. Promote changes from sandbox to the dev branch via the review UI
8. Pull updated state: `xano workspace pull ./xano -p [profile] -b [dev-branch]`

#### Creating a new endpoint or function
1. Create the `.xs` file locally following existing workspace patterns
2. Validate the XanoScript
3. Push to sandbox: `xano sandbox push ./xano -p [profile]`
4. Review and promote: `xano sandbox review -p [profile]`

#### Resetting the sandbox
If the sandbox gets into a bad state or you want a clean slate:
```bash
xano sandbox reset -p [profile] -f
```

#### Running tests in sandbox
```bash
xano sandbox unit_test run_all -p [profile]
xano sandbox workflow_test run_all -p [profile]
```

#### Managing sandbox environment variables
```bash
xano sandbox env list -p [profile]
xano sandbox env set KEY value -p [profile]
xano sandbox env get_all -p [profile]
```

### Alternative: Workspace Push (only if user opted in)

> ⚠️ **Warning:** `workspace push` pushes directly to the workspace branch. Schema changes (table adds/removes/modifications) take effect on the real database immediately, even on a dev branch. This is NOT isolated. `allow_push` must be enabled on the workspace (disabled by default as a safety guard).

1. Pull workspace: `xano workspace pull ./xano -p [profile] -b [dev-branch]`
2. Edit `.xs` files
3. Validate XanoScript
4. Preview changes: `xano workspace push ./xano -p [profile] -b [dev-branch] --dry-run`
5. Push: `xano workspace push ./xano -p [profile] -b [dev-branch]`

### Deploying to live
1. [specific steps based on user's merge/promotion workflow]

## No-Go Zones

[List specific tables, endpoints, functions, or env vars the user said not to touch]

- **Tables:** [list or "none specified"]
- **Endpoints:** [list or "none specified"]
- **Functions:** [list or "none specified"]
- **Env Vars:** [list or "none specified"]

## Team Conventions

[Any naming conventions, code style rules, or collaboration norms]

## Troubleshooting

### If sandbox push fails
- Check sandbox state: `xano sandbox get -p [profile]`
- Reset if needed: `xano sandbox reset -p [profile] -f`
- Re-push after reset
- Ensure your CLI profile has the correct workspace ID and branch

### If sandbox commands are not recognized
- Your CLI may be outdated. Update with: `xano update` or `npm install -g @xano/cli`

### If workspace push fails with "allow_push disabled"
- `allow_push` is disabled by default on Xano workspaces as a safety guard
- Enable in the Xano dashboard workspace settings, or via the Meta API
- Consider using the sandbox workflow instead — it's safer and doesn't require enabling push

### If validation passes but runtime fails
[Known gotchas like where clause syntax, $auth.account_id issues]
```

Keep the playbook **concise and actionable**. Every line should be something that changes how you develop. No filler.

---

## Phase 5: Update CLAUDE.md

Add or update a small Xano section in the project's `CLAUDE.md` that points to the playbook and lists the top 3-5 most critical rules. This ensures every future conversation loads the key constraints immediately.

```markdown
## Xano Backend

- **Workspace:** [Name] (ID: [id]) on [instance]
- **Status:** [Production/Development/etc.]
- **CLI Profile:** `[profile-name]` (always use `-p [profile-name]`)
- **Playbook:** See `.claude/xano-workspace-profile.md` for full development rules

### Critical Rules
1. Always use the sandbox workflow — `sandbox push` → `sandbox review` → promote. Never push directly to workspace.
2. [Branch safety rule — e.g., never touch v1/live directly]
3. [Most important data/schema constraint]
4. Always validate XanoScript before pushing to sandbox
5. [Other key constraint from user answers]
```

If CLAUDE.md already has a Xano section, update it rather than duplicating.

---

## Phase 6: Summary

Present a brief summary to the user:

1. Environment status (what's working)
2. Workspace connected and status confirmed
3. Where the playbook was saved
4. The top 3 rules they should know
5. Any recommendations (e.g., "You should create a dev branch", "Consider setting up separate data sources", "Your CLI is outdated")

End with: **"You're all set. I'll follow the development playbook for all future Xano work in this project."**

---

## Important Behavioral Notes

- **Sandbox is the default.** Always prescribe the sandbox workflow unless the user explicitly chooses workspace push or another method. If the user hasn't expressed a preference, default to sandbox.
- **Explain why sandbox > workspace push** when relevant: workspace push hits the real branch immediately — schema changes (table adds/removes/modifications) affect the real database even on a dev branch. The sandbox is fully isolated: nothing touches the real workspace until the user promotes from the review UI.
- **workspace push is disabled by default.** Do not guide the user through enabling `allow_push` unless they specifically ask for the workspace push workflow. If they do, explain the risks clearly.
- **Sandbox commands use the profile.** Sandbox commands (`xano sandbox *`) inherit workspace and branch from the CLI profile. They do not accept `-w` or `-b` flags. This is why setting up a dedicated CLI profile with the correct workspace ID and branch is essential during init.
- **Be conversational, not robotic.** Group questions naturally, don't interrogate.
- **Adapt to answers.** If they say "just me, solo dev, early development" — skip team/collaboration questions and keep rules lightweight.
- **Don't over-generate.** A solo dev on a pre-launch app doesn't need 15 safety rules. Scale the playbook to the actual risk level.
- **Validate, don't assume.** If you see a branch called `live`, confirm with the user that it's actually the production branch.
- **Respect existing setup.** If there's already a CLAUDE.md with Xano config, preserve what's there and augment it — don't overwrite.
- **Tool priority:** MCP tools (`mcp__xano-developer__*`) → CLI (`xano` commands) → Meta API via curl → ask the user. Use MCP for docs/validation; use CLI for workspace/branch/function/sandbox operations. Both can coexist.
- **Prescriptive but adaptable.** Default to sandbox, but respect the user's choice if they prefer workspace push or another method. The user has final say.
- **If the user provides args** (e.g., `/xano-init workspace 43`), skip the workspace selection step and use the provided ID.

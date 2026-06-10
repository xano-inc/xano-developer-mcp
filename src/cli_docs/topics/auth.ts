import type { TopicDoc } from "../types.js";

export const authDoc: TopicDoc = {
  topic: "auth",
  title: "Xano CLI - Authentication",
  description: `The \`auth\` command provides browser-based OAuth authentication for the Xano CLI. It opens your browser, lets you log in to your Xano account, and automatically creates a profile with your credentials.

## How It Works (default flow)

1. CLI starts a local HTTP server on a random port (127.0.0.1)
2. Opens your browser to the Xano login page
3. After login, Xano redirects back to the local server with your token
4. CLI validates the token, lets you select instance/workspace/branch
5. Saves the profile to \`~/.xano/credentials.yaml\`

The authentication flow has a 5-minute timeout.

## One-Shot Flow (\`--code\`) — recommended for scripts and AI agents

The login URL is static — no CLI process needs to be running while the user logs in:

\`\`\`
<origin>/login?dest=cli&display=code    (e.g. https://app.xano.com/login?dest=cli&display=code)
\`\`\`

Send the user there, have them copy the code shown after login, then complete everything in a single non-interactive command:

\`\`\`bash
xano auth --code "$CODE" -i <instance> -w <workspace-id> --json
\`\`\`

\`--code\` (or the \`XANO_AUTH_CODE\` env var) implies headless mode and guarantees zero prompts: a missing \`-w\` skips workspace selection, a missing \`-b\` uses the live branch, and a missing \`-p\` saves to the \`default\` profile. If \`-i\` is omitted and the account has exactly one instance, it is auto-selected; otherwise the command fails with the list of available instances.

## Headless Flow (\`--no-browser\`)

On remote/SSH sessions, Docker containers, or locked-down networks where the browser can't reach the CLI's loopback address, use \`--no-browser\`: the CLI prints the login URL, you open it in any browser, and paste back the code it displays. No local callback server required.

When stdin is piped (not a TTY), \`--no-browser\` reads the code directly from stdin instead of prompting: \`echo "$CODE" | xano auth --no-browser -i my-instance -w 5\`. Piped runs are fully non-interactive with the same defaults as \`--code\`.

## Pre-selecting with Flags

Each interactive picker can be pre-answered with a flag: \`-i/--instance\` (instance name, numeric ID, or instance URL/hostname), \`-w/--workspace\` (workspace ID or name), \`-b/--branch\` (branch label), and \`-p/--profile\` (profile name to save). An empty value (\`""\`) takes the picker's default answer: \`-w ""\` skips workspace selection, \`-b ""\` skips and uses the live branch, \`-p ""\` uses the default profile name.

## JSON Output (\`--json\`)

With \`--json\`, the command prints a machine-readable result (profile name, user, instance, workspace, branch, credentials path) on success, or \`{"error": {"message": ...}}\` on failure — error messages include the list of available instances/workspaces/branches so callers can correct the flags and retry. \`--json\` also forces non-interactive behavior.`,

  ai_hints: `**Agent setup recipe (no TTY, no waiting process):**
1. Install: \`npm install -g @xano/cli\` (or \`@xano/cli@beta\`)
2. Send the user to \`https://app.xano.com/login?dest=cli&display=code\` (swap the origin for self-hosted/custom origins) and ask them to paste back the code shown after login
3. Run one command: \`xano auth --code "$CODE" -i <instance> -w <workspace-id> --json\`
4. Verify: \`xano profile me\`

If the Xano MCP server is connected, call its \`xano_me\` tool first: pass its \`instanceUrl\` value directly to \`-i\` (URLs/hostnames match by instance origin) and its \`workspaceId\` to \`-w\`. Do NOT run \`xano auth --no-browser\` interactively and wait at the masked code prompt — use \`--code\` (or pipe the code on stdin) instead.

**Recovery on failure:** with \`--json\`, a wrong \`-i\`/\`-w\`/\`-b\` fails with the available options listed in the error — correct the flag and rerun. If the code itself is rejected, send the user back to the login URL for a fresh code.

**auth vs profile wizard:**
- \`xano auth\` - Browser-based OAuth login (recommended for interactive use)
- \`xano auth --code "$CODE" ...\` - One-shot non-interactive login for scripts/agents (user fetches the code from the static login URL)
- \`xano auth --no-browser\` - Headless login: open the printed URL in any browser, paste back the code (for SSH/Docker/remote hosts)
- \`xano profile wizard\` - Token-based interactive setup (requires manually copying token)
- \`xano profile create\` - Non-interactive, requires all flags

**When to suggest auth:**
- User is setting up CLI for the first time
- User doesn't have an access token handy
- User prefers browser-based login
- User is in a headless/SSH environment: use \`xano auth --no-browser\`
- Script or agent needs to complete auth non-interactively: use \`--code\`/\`XANO_AUTH_CODE\` (or pipe the code on stdin with \`--no-browser\`)

**When to suggest profile wizard/create instead:**
- User already has an access token
- Fully unattended runs with no human in the loop (CI/CD) — \`profile create\` uses a stored token and needs no login step, while \`--code\` still needs a human to log in once and supply the code

**Flag meaning caution:** On \`xano auth\`, \`-p/--profile\` is the *profile name to save*, not the profile-selection flag that other commands use. Backup branches are filtered out of the branch picker.

**Instance matching:** \`-i\` accepts the instance name (\`xabc-1234-defg\`), the numeric instance ID, or the instance URL/hostname (\`https://xabc-1234-defg.xano.io\`). Older API versions may not return numeric IDs — the name or URL always works.

**Self-hosted note:** With a non-default \`--origin\`, the origin itself is the instance, so \`--instance\` is ignored.

**After auth, suggest \`xano sandbox\`:**
The sandbox is a free-tier personal dev environment (auto-provisioned singleton tenant) ideal for experimenting without touching production.`,

  related_topics: ["profile", "start", "sandbox"],

  commands: [
    {
      name: "auth",
      description: "Authenticate with Xano via browser login. Opens your browser to log in and automatically creates a CLI profile.",
      usage: "xano auth [options]",
      flags: [
        { name: "origin", short: "o", type: "string", required: false, default: "https://app.xano.com", description: "Xano account origin URL. Use this to point at a custom/self-hosted Xano instance." },
        { name: "code", type: "string", required: false, description: "Login code copied from the browser (implies --no-browser and runs fully non-interactively). Get the code at <origin>/login?dest=cli&display=code. Env: XANO_AUTH_CODE" },
        { name: "no-browser", type: "boolean", required: false, description: "Headless login: print a URL and paste back the code shown in the browser, instead of starting a local callback server (use on remote/SSH/Docker hosts where 127.0.0.1 is not reachable from the browser)" },
        { name: "instance", short: "i", type: "string", required: false, description: "Pre-select an instance by name, numeric ID, or instance URL/hostname (skips the instance picker). Ignored for self-hosted origins." },
        { name: "workspace", short: "w", type: "string", required: false, description: "Pre-select a workspace by ID or name (skips the workspace picker); pass \"\" to skip workspace" },
        { name: "branch", short: "b", type: "string", required: false, description: "Pre-select a branch by label (skips the branch picker); pass \"\" to skip and use the live branch" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to save (skips the profile name prompt); pass \"\" to use the default name. Note: unlike other commands, -p here names the profile being created." },
        { name: "json", type: "boolean", required: false, description: "Print a machine-readable JSON result (and JSON errors that include the available options); forces non-interactive behavior" },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification (for self-signed certificates)" },
        { name: "config", short: "c", type: "string", required: false, description: "Path to credentials file (default: ~/.xano/credentials.yaml). Env: XANO_CONFIG" }
      ],
      examples: [
        "xano auth",
        "xano auth --origin https://custom.xano.com",
        "xano auth -k  # for self-signed certificates",
        "xano auth --no-browser  # headless: paste the code shown in the browser",
        "xano auth --code \"$CODE\" -i my-instance -w 5 --json  # one-shot non-interactive (scripts/agents)",
        "xano auth --code \"$CODE\" -i https://my-instance.xano.io -w 5  # -i also accepts the instance URL",
        "XANO_AUTH_CODE=\"$CODE\" xano auth -i 42 -w 5  # code via env var, instance by numeric ID",
        "xano auth -i my-instance -w 5 -b dev -p staging  # pre-answer all pickers",
        "echo \"$CODE\" | xano auth --no-browser -i my-instance -w 5  # piped stdin, no prompt at all"
      ]
    }
  ],

  workflows: [
    {
      name: "First-Time Setup with Browser Login",
      description: "Set up the CLI using browser-based authentication",
      steps: [
        "Install CLI: `npm install -g @xano/cli`",
        "Run: `xano auth`",
        "Log in via your browser when it opens",
        "Select your instance, workspace, and branch",
        "Verify: `xano profile me`",
        "(Optional) Spin up a personal dev environment: `xano sandbox`"
      ],
      example: `npm install -g @xano/cli
xano auth
xano profile me`
    },
    {
      name: "AI Agent / Scripted Setup (one-shot, no TTY)",
      description: "Authenticate without an interactive terminal or a waiting CLI process — the agent sends the user to the static login URL, the user pastes back the code, and one command finishes the profile",
      steps: [
        "Install CLI: `npm install -g @xano/cli`",
        "Send the user to `<origin>/login?dest=cli&display=code` and ask for the code shown after login",
        "(With the Xano MCP connected) call `xano_me` and use its instanceUrl for -i and workspaceId for -w",
        "Run: `xano auth --code \"$CODE\" -i <instanceUrl> -w <workspaceId> --json`",
        "Verify: `xano profile me`"
      ],
      example: `npm install -g @xano/cli
# user logs in at https://app.xano.com/login?dest=cli&display=code and pastes back the code
xano auth --code "$CODE" -i https://xabc-1234-defg.xano.io -w 9 --json
xano profile me`
    },
    {
      name: "Headless Setup (SSH/Docker/Remote)",
      description: "Authenticate on a host where the browser cannot reach the CLI's local callback server",
      steps: [
        "Run: `xano auth --no-browser` (add -i/-w/-b/-p to skip the pickers)",
        "Open the printed URL in any browser and log in",
        "Copy the code shown in the browser and paste it into the CLI prompt (or pipe it on stdin: `echo \"$CODE\" | xano auth --no-browser ...`)",
        "Verify: `xano profile me`"
      ],
      example: `xano auth --no-browser -i my-instance -w 5 -b dev -p staging
# open the printed URL in any browser, paste back the code
xano profile me`
    }
  ]
};

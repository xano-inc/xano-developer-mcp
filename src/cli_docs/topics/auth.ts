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

## Headless Flow (\`--no-browser\`)

On remote/SSH sessions, Docker containers, or locked-down networks where the browser can't reach the CLI's loopback address, use \`--no-browser\`: the CLI prints a login URL, you open it in any browser, and paste back the code it displays. No local callback server required.

When stdin is piped (not a TTY), \`--no-browser\` reads the code directly from stdin instead of prompting, so scripts and AI agents can complete the flow without an interactive terminal: \`echo "$CODE" | xano auth --no-browser -i my-instance -w 5 -b dev -p staging\`.

## Pre-selecting with Flags

Each interactive picker can be pre-answered with a flag: \`-i/--instance\` (instance name), \`-w/--workspace\` (workspace ID or name), \`-b/--branch\` (branch label), and \`-p/--profile\` (profile name to save). An empty value (\`""\`) takes the picker's default answer: \`-w ""\` skips workspace selection, \`-b ""\` skips and uses the live branch, \`-p ""\` uses the default profile name. With all four set alongside \`--no-browser\`, the only input is pasting the code from the browser — useful for scripted or remote setups.`,

  ai_hints: `**auth vs profile wizard:**
- \`xano auth\` - Browser-based OAuth login (recommended for interactive use)
- \`xano auth --no-browser\` - Headless login: open the printed URL in any browser, paste back the code (for SSH/Docker/remote hosts)
- \`xano profile wizard\` - Token-based interactive setup (requires manually copying token)
- \`xano profile create\` - Non-interactive, requires all flags

**When to suggest auth:**
- User is setting up CLI for the first time
- User doesn't have an access token handy
- User prefers browser-based login
- User is in a headless/SSH environment: use \`xano auth --no-browser\`
- Script or agent needs to complete headless auth non-interactively: pipe the code on stdin, e.g. \`echo "$CODE" | xano auth --no-browser ...\` (with -i/-w/-b/-p set, no prompts remain)

**When to suggest profile wizard/create instead:**
- User already has an access token
- User needs fully non-interactive setup (CI/CD) — \`profile create\` requires no prompts at all

**Flag meaning caution:** On \`xano auth\`, \`-p/--profile\` is the *profile name to save*, not the profile-selection flag that other commands use. Backup branches are filtered out of the branch picker.

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
        { name: "no-browser", type: "boolean", required: false, description: "Headless login: print a URL and paste back the code shown in the browser, instead of starting a local callback server (use on remote/SSH/Docker hosts where 127.0.0.1 is not reachable from the browser)" },
        { name: "instance", short: "i", type: "string", required: false, description: "Pre-select an instance by name (skips the instance picker). Ignored for self-hosted origins." },
        { name: "workspace", short: "w", type: "string", required: false, description: "Pre-select a workspace by ID or name (skips the workspace picker); pass \"\" to skip workspace" },
        { name: "branch", short: "b", type: "string", required: false, description: "Pre-select a branch by label (skips the branch picker); pass \"\" to skip and use the live branch" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to save (skips the profile name prompt); pass \"\" to use the default name. Note: unlike other commands, -p here names the profile being created." },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification (for self-signed certificates)" },
        { name: "config", short: "c", type: "string", required: false, description: "Path to credentials file (default: ~/.xano/credentials.yaml). Env: XANO_CONFIG" }
      ],
      examples: [
        "xano auth",
        "xano auth --origin https://custom.xano.com",
        "xano auth -k  # for self-signed certificates",
        "xano auth --no-browser  # headless: paste the code shown in the browser",
        "xano auth -i my-instance -w 5 -b dev -p staging  # pre-answer all pickers",
        "xano auth --no-browser -i my-instance -w \"\" -b \"\" -p \"\"  # scripted setup, only the code prompt remains",
        "echo \"$CODE\" | xano auth --no-browser -i my-instance -w 5 -b dev -p staging  # fully scripted: code read from piped stdin, no prompt at all"
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

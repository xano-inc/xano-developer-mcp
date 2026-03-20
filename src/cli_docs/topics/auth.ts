import type { TopicDoc } from "../types.js";

export const authDoc: TopicDoc = {
  topic: "auth",
  title: "Xano CLI - Authentication",
  description: `The \`auth\` command provides browser-based OAuth authentication for the Xano CLI. It opens your browser, lets you log in to your Xano account, and automatically creates a profile with your credentials.

## How It Works

1. CLI starts a local HTTP server on a random port
2. Opens your browser to the Xano login page
3. After login, Xano redirects back to the local server with your token
4. CLI validates the token, lets you select instance/workspace/branch
5. Saves the profile to \`~/.xano/credentials.yaml\`

The authentication flow has a 5-minute timeout.`,

  ai_hints: `**auth vs profile:wizard:**
- \`xano auth\` - Browser-based OAuth login (recommended for interactive use)
- \`xano profile:wizard\` - Token-based interactive setup (requires manually copying token)
- \`xano profile:create\` - Non-interactive, requires all flags

**When to suggest auth:**
- User is setting up CLI for the first time
- User doesn't have an access token handy
- User prefers browser-based login

**When to suggest profile:wizard instead:**
- User already has an access token
- User is in a headless/SSH environment without browser access
- User needs non-interactive setup (CI/CD)`,

  related_topics: ["profile", "start"],

  commands: [
    {
      name: "auth",
      description: "Authenticate with Xano via browser login. Opens your browser to log in and automatically creates a CLI profile.",
      usage: "xano auth [options]",
      flags: [
        { name: "origin", type: "string", required: false, description: "Xano account origin URL (e.g., https://app.xano.com)" },
        { name: "insecure", short: "k", type: "boolean", required: false, description: "Skip TLS certificate verification (for self-signed certs)" }
      ],
      examples: [
        "xano auth",
        "xano auth --origin https://app.xano.com",
        "xano auth -k  # for self-signed certificates"
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
        "Verify: `xano profile:me`"
      ],
      example: `npm install -g @xano/cli
xano auth
xano profile:me`
    }
  ]
};

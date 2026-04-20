import type { TopicDoc } from "../types.js";

export const releaseDoc: TopicDoc = {
  topic: "release",
  title: "Xano CLI - Release Management",
  description: `Release commands let you manage named releases in a Xano workspace. Releases are versioned snapshots of a branch, used for deploying specific versions to tenants.

## Key Concepts

- **Release**: A named snapshot of a branch at a point in time, used for versioned deployments.
- **Hotfix release**: A release that bypasses the normal release flow for urgent production fixes.
- **Export/Import**: Releases can be exported as portable files and imported into other workspaces.
- **Pull/Push**: Similar to \`workspace pull\` and \`workspace push\`, but scoped to a release in multidoc format. Both use the \`-d/--directory\` flag (default: current directory), NOT a positional argument.
- **Deploy**: Promotes a release into a target workspace as a new branch.

## Release Identification

Releases are identified by their **name** (e.g., "v1.0.0", "2024-03-hotfix").

## Syntax note

Xano CLI commands are SPACE-separated (e.g. \`xano release list\`), not colon-separated.`,

  ai_hints: `**Key concepts:**
- Releases are versioned snapshots of a branch, created for deployment to tenants
- Created from branches and deployed to workspaces as new branches
- \`release pull\` and \`release push\` work like \`workspace pull\`/\`workspace push\` but scoped to releases (directory is \`-d/--directory\`, not a positional arg)
- \`release export\` and \`release import\` allow portable release files for moving between workspaces
- Hotfix releases bypass the normal release flow for urgent production fixes
- Use \`--table-ids\` on \`release create\` to include only specific tables in the release
- \`release deploy\` takes the release name as a POSITIONAL argument (not \`-r\`)

**Typical workflow:**
1. \`xano release list\` - see available releases
2. \`xano release create v1.0.0 -b dev\` - create release from branch (name is positional)
3. Deploy to a workspace: \`xano release deploy v1.0.0 -w 40 --set_live\`
4. \`xano release export v1.0.0 --output ./release.tar.gz\` - export for portability`,

  related_topics: ["branch", "tenant", "workspace", "sandbox"],

  commands: [
    {
      name: "release list",
      description: "List all releases in a workspace",
      usage: "xano release list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release list",
        "xano release list -w 123",
        "xano release list --output json"
      ]
    },
    {
      name: "release get",
      description: "Get details for a specific release",
      usage: "xano release get <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to retrieve" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release get v1.0.0",
        "xano release get v1.0.0 --output json"
      ]
    },
    {
      name: "release create",
      description: "Create a named release from a branch. The release name is a positional argument.",
      usage: "xano release create <name> --branch <branch> [options]",
      args: [
        { name: "name", required: true, description: "Name for the new release (e.g. v1.0.0)" }
      ],
      flags: [
        { name: "branch", short: "b", type: "string", required: true, description: "Branch to create the release from" },
        { name: "description", short: "d", type: "string", required: false, description: "Description for the release" },
        { name: "hotfix", type: "boolean", required: false, default: "false", description: "Mark this release as a hotfix" },
        { name: "table-ids", type: "string", required: false, description: "Comma-separated table IDs to include in the release" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release create v1.0.0 -b dev",
        'xano release create v1.1.0 --branch staging -d "Staging release"',
        "xano release create hotfix-auth -b v1 --hotfix",
        "xano release create v1.2.0 -b dev --table-ids 1,2,3"
      ]
    },
    {
      name: "release edit",
      description: "Edit release metadata",
      usage: "xano release edit <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to edit" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "New name for the release" },
        { name: "description", short: "d", type: "string", required: false, description: "New description for the release" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release edit v1.0.0 --name v1.0.1",
        'xano release edit v1.0.0 -d "Updated description"'
      ]
    },
    {
      name: "release delete",
      description: "Delete a release",
      usage: "xano release delete <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to delete" }
      ],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, default: "false", description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release delete v1.0.0",
        "xano release delete v1.0.0 --force"
      ]
    },
    {
      name: "release export",
      description: "Download a release as a portable file. Note: the file-path flag is `--output` (no short form), and `-o/--format` controls the summary/JSON output format.",
      usage: "xano release export <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to export" }
      ],
      flags: [
        { name: "output", type: "string", required: false, description: "File path for the downloaded release file (defaults to ./release-{name}.tar.gz). No short form." },
        { name: "format", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release export v1.0.0",
        "xano release export v1.0.0 --output ./releases/v1.0.0.tar.gz",
        "xano release export v1.0.0 -o json"
      ]
    },
    {
      name: "release import",
      description: "Import a release from a file",
      usage: "xano release import --file <path> [options]",
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Path to the release file to import" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release import --file ./releases/v1.0.0.tar.gz",
        "xano release import -f ./release.tar.gz -w 123"
      ]
    },
    {
      name: "release pull",
      description: "Pull release contents to a local directory in multidoc format. The target directory is the -d/--directory flag (default: current directory), not a positional argument.",
      usage: "xano release pull -r <name> [options]",
      flags: [
        { name: "release", short: "r", type: "string", required: true, description: "Name of the release to pull" },
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Local directory to pull release contents into (defaults to current directory)" },
        { name: "env", type: "boolean", required: false, default: "false", description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, default: "false", description: "Include table records" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release pull -r v1.0.0",
        "xano release pull -d ./release-v1 -r v1.0.0",
        "xano release pull -d ./release-v1 --release v1.0.0 --env --records"
      ]
    },
    {
      name: "release push",
      description: "Push a local directory as a new release. Directory is the -d/--directory flag (default: current directory), not a positional argument.",
      usage: "xano release push -n <name> [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Name for the new release" },
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Local directory containing files to push as a release (defaults to current directory)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch to associate the release with" },
        { name: "hotfix", type: "boolean", required: false, default: "false", description: "Mark this release as a hotfix" },
        { name: "description", type: "string", required: false, description: "Description for the release" },
        { name: "records", type: "boolean", required: false, default: "true", description: "Include records (default: true; use --no-records to exclude)" },
        { name: "env", type: "boolean", required: false, default: "true", description: "Include environment variables (default: true; use --no-env to exclude)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        "xano release push -n v1.0.0",
        "xano release push -d ./release-v1 -n v1.0.0",
        'xano release push -d ./release-v1 -n v1.1.0 -b dev --description "Staging release"',
        "xano release push -n hotfix-1 --hotfix --no-records --no-env"
      ]
    },
    {
      name: "release deploy",
      description: "Deploy a release to its workspace as a new branch. Release name is a positional argument.",
      usage: "xano release deploy <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to deploy" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch label for the new branch (defaults to release branch name)" },
        { name: "set_live", type: "boolean", required: false, default: "false", description: "Set the new branch as live after deploy. Default is off; pass --set_live to enable. (There is no --no-set_live form.)" },
        { name: "force", short: "f", type: "boolean", required: false, default: "false", description: "Skip confirmation prompt" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "profile", short: "p", type: "string", required: false, description: "Profile name to use" }
      ],
      examples: [
        'xano release deploy "v1.0"',
        'xano release deploy "v1.0" --force',
        'xano release deploy "v1.0" --branch "restore-v1"',
        'xano release deploy "v1.0" -w 40 --set_live --force',
        'xano release deploy "v1.0" -w 40 -o json --force'
      ]
    }
  ],

  workflows: [
    {
      name: "Create and Deploy Release",
      description: "Create a release from a branch and deploy it into a workspace",
      steps: [
        "List branches to find the source: `xano branch list`",
        "Create a release: `xano release create v1.0.0 -b dev`",
        "Verify the release: `xano release get v1.0.0`",
        "Deploy into workspace: `xano release deploy v1.0.0 -w 40 --set_live --force`"
      ],
      example: `xano branch list
xano release create v1.0.0 -b dev -d "Initial release"
xano release get v1.0.0
xano release deploy v1.0.0 -w 40 --set_live --force`
    },
    {
      name: "Export and Import Release",
      description: "Export a release from one workspace and import it into another",
      steps: [
        "Export the release: `xano release export v1.0.0 --output ./v1.0.0.tar.gz`",
        "Transfer the file to the target environment",
        "Import into another workspace: `xano release import --file ./v1.0.0.tar.gz -w 456`",
        "Verify: `xano release list -w 456`"
      ],
      example: `# Export from source workspace
xano release export v1.0.0 --output ./v1.0.0.tar.gz

# Import into target workspace
xano release import --file ./v1.0.0.tar.gz -w 456
xano release list -w 456`
    },
    {
      name: "Release Pull and Push",
      description: "Work with release contents as local files",
      steps: [
        "Pull a release: `xano release pull -d ./release-v1 -r v1.0.0 --env --records`",
        "Inspect / edit files locally",
        "Publish as a new release: `xano release push -d ./release-v1 -n v1.0.1 -b dev`"
      ]
    }
  ]
};

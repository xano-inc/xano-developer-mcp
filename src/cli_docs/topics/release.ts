import type { TopicDoc } from "../types.js";

export const releaseDoc: TopicDoc = {
  topic: "release",
  title: "Xano CLI - Release Management",
  description: `Release commands let you manage named releases in a Xano workspace. Releases are versioned snapshots of a branch, used for deploying specific versions to tenants.

## Key Concepts

- **Release**: A named snapshot of a branch at a point in time, used for versioned deployments.
- **Hotfix release**: A release that bypasses the normal release flow for urgent production fixes.
- **Export/Import**: Releases can be exported as portable files and imported into other workspaces.
- **Pull/Push**: Similar to \`workspace:pull\` and \`workspace:push\`, but scoped to a release in multidoc format.

## Release Identification

Releases are identified by their **name** (e.g., "v1.0.0", "2024-03-hotfix").`,

  ai_hints: `**Key concepts:**
- Releases are versioned snapshots of a branch, created for deployment to tenants
- Created from branches and deployed to tenants as part of the release lifecycle
- \`release:pull\` and \`release:push\` work like \`workspace:pull\` and \`workspace:push\` but scoped to releases
- \`release:export\` and \`release:import\` allow portable release files for moving between workspaces
- Hotfix releases bypass the normal release flow for urgent production fixes
- Use \`--table-ids\` on \`release:create\` to include only specific tables in the release

**Typical workflow:**
1. \`xano release:list\` - see available releases
2. \`xano release:create -n v1.0.0 -b dev\` - create release from branch
3. Deploy release to tenant (see tenant topic)
4. \`xano release:export v1.0.0 --output ./release.tar.gz\` - export for portability`,

  related_topics: ["branch", "tenant", "workspace"],

  commands: [
    {
      name: "release:list",
      description: "List all releases in a workspace",
      usage: "xano release:list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano release:list",
        "xano release:list -w 123",
        "xano release:list --output json"
      ]
    },
    {
      name: "release:get",
      description: "Get details for a specific release",
      usage: "xano release:get <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to retrieve" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano release:get v1.0.0",
        "xano release:get v1.0.0 --output json"
      ]
    },
    {
      name: "release:create",
      description: "Create a named release from a branch",
      usage: "xano release:create --name <name> --branch <branch> [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Name for the new release" },
        { name: "branch", short: "b", type: "string", required: true, description: "Branch to create the release from" },
        { name: "description", short: "d", type: "string", required: false, description: "Description for the release" },
        { name: "hotfix", type: "boolean", required: false, description: "Mark this release as a hotfix" },
        { name: "table-ids", type: "string", required: false, description: "Comma-separated table IDs to include in the release" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano release:create -n v1.0.0 -b dev",
        'xano release:create --name v1.1.0 --branch staging -d "Staging release"',
        "xano release:create -n hotfix-auth -b v1 --hotfix"
      ]
    },
    {
      name: "release:edit",
      description: "Edit release metadata",
      usage: "xano release:edit <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to edit" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "New name for the release" },
        { name: "description", short: "d", type: "string", required: false, description: "New description for the release" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano release:edit v1.0.0 --name v1.0.1",
        'xano release:edit v1.0.0 -d "Updated description"'
      ]
    },
    {
      name: "release:delete",
      description: "Delete a release",
      usage: "xano release:delete <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to delete" }
      ],
      flags: [
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano release:delete v1.0.0",
        "xano release:delete v1.0.0 --force"
      ]
    },
    {
      name: "release:export",
      description: "Download a release as a portable file",
      usage: "xano release:export <release_name> [options]",
      args: [
        { name: "release_name", required: true, description: "Name of the release to export" }
      ],
      flags: [
        { name: "output", type: "string", required: false, description: "File path for the downloaded release file" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano release:export v1.0.0",
        "xano release:export v1.0.0 --output ./releases/v1.0.0.tar.gz"
      ]
    },
    {
      name: "release:import",
      description: "Import a release from a file",
      usage: "xano release:import --file <path> [options]",
      flags: [
        { name: "file", type: "string", required: true, description: "Path to the release file to import" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano release:import --file ./releases/v1.0.0.tar.gz",
        "xano release:import --file ./release.tar.gz -w 123"
      ]
    },
    {
      name: "release:pull",
      description: "Pull release contents to local files in multidoc format",
      usage: "xano release:pull <directory> --release <name> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory to pull release contents into" }
      ],
      flags: [
        { name: "release", short: "r", type: "string", required: true, description: "Name of the release to pull" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include table records" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano release:pull ./release-v1 -r v1.0.0",
        "xano release:pull ./release-v1 --release v1.0.0 --env --records"
      ]
    },
    {
      name: "release:push",
      description: "Push local files as a new release",
      usage: "xano release:push <directory> --name <name> [options]",
      args: [
        { name: "directory", required: true, description: "Local directory containing files to push as a release" }
      ],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Name for the new release" },
        { name: "branch", short: "b", type: "string", required: false, description: "Branch to associate the release with" },
        { name: "hotfix", type: "boolean", required: false, description: "Mark this release as a hotfix" },
        { name: "description", short: "d", type: "string", required: false, description: "Description for the release" },
        { name: "records", type: "boolean", required: false, description: "Include records (--no-records to exclude)" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables (--no-env to exclude)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano release:push ./release-v1 -n v1.0.0",
        "xano release:push ./release-v1 --name v1.1.0 -b dev --records --env",
        "xano release:push ./release-v1 -n hotfix-1 --hotfix --no-records"
      ]
    }
  ],

  workflows: [
    {
      name: "Create and Deploy Release",
      description: "Create a release from a branch and deploy it to a tenant",
      steps: [
        "List branches to find the source: `xano branch:list`",
        "Create a release: `xano release:create -n v1.0.0 -b dev`",
        "Verify the release: `xano release:get v1.0.0`",
        "Deploy to tenant: `xano tenant:deploy_release my-tenant -r v1.0.0`"
      ],
      example: `xano branch:list
xano release:create -n v1.0.0 -b dev -d "Initial release"
xano release:get v1.0.0
xano tenant:deploy_release my-tenant -r v1.0.0`
    },
    {
      name: "Export and Import Release",
      description: "Export a release from one workspace and import it into another",
      steps: [
        "Export the release: `xano release:export v1.0.0 --output ./v1.0.0.tar.gz`",
        "Transfer the file to the target environment",
        "Import into another workspace: `xano release:import --file ./v1.0.0.tar.gz -w 456`",
        "Verify: `xano release:list -w 456`"
      ],
      example: `# Export from source workspace
xano release:export v1.0.0 --output ./v1.0.0.tar.gz

# Import into target workspace
xano release:import --file ./v1.0.0.tar.gz -w 456
xano release:list -w 456`
    }
  ]
};

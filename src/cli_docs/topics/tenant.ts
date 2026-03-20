import type { TopicDoc } from "../types.js";

export const tenantDoc: TopicDoc = {
  topic: "tenant",
  title: "Xano CLI - Tenant Management",
  description: `Tenant commands let you manage tenants in a Xano workspace. Tenants are isolated deployment targets for multi-tenant and white-label applications. Each tenant has its own database, environment variables, and configuration.

## Key Concepts

- **Tenant**: An isolated deployment instance within a workspace, identified by name.
- **Cluster**: Infrastructure where tenants run (Kubernetes or Xano-managed).
- **Deployments**: Tenants receive updates via named releases or platform versions.
- **Environment variables**: Managed per-tenant for configuration isolation.
- **Backups**: Per-tenant backup and restore for disaster recovery.
- **Pull/Push**: Similar to \`workspace:pull/push\` but scoped to a specific tenant.

## Tenant Identification

Tenants are identified by their **name** (not numeric IDs).`,

  ai_hints: `**Key concepts:**
- Tenants are deployment targets for multi-tenant/white-label applications
- Each tenant is isolated with its own database, env vars, and configuration
- \`tenant:pull\` and \`tenant:push\` work like \`workspace:pull/push\` but scoped to a tenant
- Deployments use named releases (\`tenant:deploy_release\`) or platform versions (\`tenant:deploy_platform\`)
- Environment variables are managed per-tenant for configuration isolation
- Backups provide disaster recovery per-tenant
- Clusters manage the infrastructure where tenants run

**Typical workflow:**
1. Create a tenant: \`xano tenant:create "My Tenant"\`
2. Set environment variables: \`xano tenant:env:set my-tenant -n API_KEY -v secret\`
3. Deploy a release: \`xano tenant:deploy_release my-tenant -r v1.0.0\`

**Tenant operations overview:**
- CRUD: create, get, list, edit, delete
- Code sync: pull, push
- Deployment: deploy_release, deploy_platform
- Configuration: env:get, env:set, env:delete, env:list, env:get_all, env:set_all
- Backups: backup:create, backup:list, backup:export, backup:import, backup:restore, backup:delete
- Infrastructure: cluster:create, cluster:list, cluster:get, cluster:edit, cluster:delete
- License: license:get, license:set
- Access: impersonate (open tenant in browser)`,

  related_topics: ["workspace", "release", "branch"],

  commands: [
    // Core CRUD
    {
      name: "tenant:list",
      description: "List all tenants in a workspace",
      usage: "xano tenant:list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant:list", "xano tenant:list -o json"]
    },
    {
      name: "tenant:get",
      description: "Get details for a specific tenant",
      usage: "xano tenant:get <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant:get my-tenant", "xano tenant:get my-tenant -o json"]
    },
    {
      name: "tenant:create",
      description: "Create a new tenant",
      usage: "xano tenant:create <display_name> [options]",
      args: [{ name: "display_name", required: true, description: "Display name for the tenant" }],
      flags: [
        { name: "description", short: "d", type: "string", required: false, description: "Tenant description" },
        { name: "cluster_id", type: "string", required: false, description: "Cluster ID to deploy to" },
        { name: "platform_id", type: "string", required: false, description: "Platform version ID" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        'xano tenant:create "My Tenant"',
        'xano tenant:create "Production" -d "Production tenant" --cluster_id 1'
      ]
    },
    {
      name: "tenant:edit",
      description: "Edit an existing tenant",
      usage: "xano tenant:edit <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "display", type: "string", required: false, description: "New display name" },
        { name: "description", short: "d", type: "string", required: false, description: "New description" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ['xano tenant:edit my-tenant --display "New Name"']
    },
    {
      name: "tenant:delete",
      description: "Delete a tenant",
      usage: "xano tenant:delete <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:delete old-tenant", "xano tenant:delete old-tenant --force"]
    },
    {
      name: "tenant:impersonate",
      description: "Open tenant dashboard in browser",
      usage: "xano tenant:impersonate <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "url-only", type: "boolean", required: false, description: "Print URL without opening browser" },
        { name: "output", short: "o", type: "string", required: false, description: "Output format: json" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:impersonate my-tenant", "xano tenant:impersonate my-tenant --url-only"]
    },
    // Pull/Push
    {
      name: "tenant:pull",
      description: "Pull tenant contents to local files (same multidoc format as workspace:pull)",
      usage: "xano tenant:pull <directory> --tenant <name> [options]",
      args: [{ name: "directory", required: true, description: "Local directory to save files" }],
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include table records" },
        { name: "draft", type: "boolean", required: false, description: "Include draft versions" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano tenant:pull ./tenant-code -t my-tenant",
        "xano tenant:pull ./backup -t my-tenant --env --records"
      ]
    },
    {
      name: "tenant:push",
      description: "Push local files to a tenant",
      usage: "xano tenant:push <directory> --tenant <name> [options]",
      args: [{ name: "directory", required: true, description: "Local directory containing files" }],
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "records", type: "boolean", required: false, description: "Include table records" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "truncate", type: "boolean", required: false, description: "Truncate tables before importing records" },
        { name: "transaction", type: "boolean", required: false, default: "true", description: "Wrap push in database transaction (--no-transaction to disable)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano tenant:push ./tenant-code -t my-tenant",
        "xano tenant:push ./data -t my-tenant --records --truncate"
      ]
    },
    // Deployments
    {
      name: "tenant:deploy_release",
      description: "Deploy a named release to a tenant",
      usage: "xano tenant:deploy_release <tenant_name> --release <name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "release", short: "r", type: "string", required: true, description: "Release name to deploy" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano tenant:deploy_release my-tenant -r v1.0.0",
        "xano tenant:deploy_release production --release v2.0.0"
      ]
    },
    {
      name: "tenant:deploy_platform",
      description: "Deploy a platform version to a tenant",
      usage: "xano tenant:deploy_platform <tenant_name> --platform_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "platform_id", type: "string", required: true, description: "Platform version ID to deploy" },
        { name: "license", type: "string", required: false, description: "Path to license file" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:deploy_platform my-tenant --platform_id 5"]
    },
    // Environment Variables
    {
      name: "tenant:env:list",
      description: "List environment variable keys for a tenant",
      usage: "xano tenant:env:list <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:env:list my-tenant"]
    },
    {
      name: "tenant:env:get",
      description: "Get a single environment variable",
      usage: "xano tenant:env:get <tenant_name> --name <key> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Variable name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:env:get my-tenant -n API_KEY"]
    },
    {
      name: "tenant:env:set",
      description: "Set an environment variable",
      usage: "xano tenant:env:set <tenant_name> --name <key> --value <val> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Variable name" },
        { name: "value", type: "string", required: true, description: "Variable value" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:env:set my-tenant -n API_KEY --value sk-123"]
    },
    {
      name: "tenant:env:delete",
      description: "Delete an environment variable",
      usage: "xano tenant:env:delete <tenant_name> --name <key> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Variable name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:env:delete my-tenant -n OLD_KEY"]
    },
    {
      name: "tenant:env:get_all",
      description: "Export all environment variables (optionally to YAML file)",
      usage: "xano tenant:env:get_all <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", type: "string", required: false, description: "Output file path (YAML format)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano tenant:env:get_all my-tenant",
        "xano tenant:env:get_all my-tenant --file ./env.yaml"
      ]
    },
    {
      name: "tenant:env:set_all",
      description: "Import all environment variables from YAML (replaces all existing)",
      usage: "xano tenant:env:set_all <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", type: "string", required: false, description: "Input YAML file with env vars" },
        { name: "clean", type: "boolean", required: false, description: "Remove all existing env vars first" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano tenant:env:set_all my-tenant --file ./env.yaml",
        "xano tenant:env:set_all my-tenant --file ./env.yaml --clean"
      ]
    },
    // Backups
    {
      name: "tenant:backup:list",
      description: "List backups for a tenant",
      usage: "xano tenant:backup:list <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant:backup:list my-tenant"]
    },
    {
      name: "tenant:backup:create",
      description: "Create a backup of a tenant",
      usage: "xano tenant:backup:create <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:backup:create my-tenant"]
    },
    {
      name: "tenant:backup:export",
      description: "Download a backup file",
      usage: "xano tenant:backup:export <tenant_name> --backup_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "backup_id", type: "string", required: true, description: "Backup ID to export" },
        { name: "output", type: "string", required: false, description: "File path for the downloaded backup" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:backup:export my-tenant --backup_id 123 --output ./backup.tar.gz"]
    },
    {
      name: "tenant:backup:import",
      description: "Import a backup file into a tenant",
      usage: "xano tenant:backup:import <tenant_name> --file <path> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", type: "string", required: true, description: "Path to backup file" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:backup:import my-tenant --file ./backup.tar.gz"]
    },
    {
      name: "tenant:backup:restore",
      description: "Restore a tenant from a backup",
      usage: "xano tenant:backup:restore <tenant_name> --backup_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "backup_id", type: "string", required: true, description: "Backup ID to restore from" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:backup:restore my-tenant --backup_id 123"]
    },
    {
      name: "tenant:backup:delete",
      description: "Delete a backup",
      usage: "xano tenant:backup:delete <tenant_name> --backup_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "backup_id", type: "string", required: true, description: "Backup ID to delete" },
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:backup:delete my-tenant --backup_id 123 --force"]
    },
    // License
    {
      name: "tenant:license:get",
      description: "Get tenant license tier",
      usage: "xano tenant:license:get <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:license:get my-tenant"]
    },
    {
      name: "tenant:license:set",
      description: "Set tenant license tier",
      usage: "xano tenant:license:set <tenant_name> --license <tier> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "license", type: "string", required: true, description: "License tier to set" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:license:set my-tenant --license tier2"]
    },
    // Clusters
    {
      name: "tenant:cluster:list",
      description: "List all clusters",
      usage: "xano tenant:cluster:list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant:cluster:list", "xano tenant:cluster:list -o json"]
    },
    {
      name: "tenant:cluster:get",
      description: "Get cluster details",
      usage: "xano tenant:cluster:get <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant:cluster:get 1"]
    },
    {
      name: "tenant:cluster:create",
      description: "Create a new cluster",
      usage: "xano tenant:cluster:create --name <name> [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Cluster name" },
        { name: "type", type: "string", required: false, description: "Cluster type: run or k8s" },
        { name: "description", short: "d", type: "string", required: false, description: "Cluster description" },
        { name: "credentials_file", type: "string", required: false, description: "Path to kubeconfig.yaml (for k8s type)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        'xano tenant:cluster:create -n "Production Cluster"',
        'xano tenant:cluster:create -n "K8s Cluster" --type k8s --credentials_file ./kubeconfig.yaml'
      ]
    },
    {
      name: "tenant:cluster:edit",
      description: "Edit a cluster",
      usage: "xano tenant:cluster:edit <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID" }],
      flags: [
        { name: "name", short: "n", type: "string", required: false, description: "New cluster name" },
        { name: "description", short: "d", type: "string", required: false, description: "New description" },
        { name: "domain", type: "string", required: false, description: "New domain" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ['xano tenant:cluster:edit 1 -n "Updated Cluster"']
    },
    {
      name: "tenant:cluster:delete",
      description: "Delete a cluster",
      usage: "xano tenant:cluster:delete <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID" }],
      flags: [
        { name: "force", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:cluster:delete 1 --force"]
    },
    {
      name: "tenant:cluster:license:get",
      description: "Get cluster kubeconfig",
      usage: "xano tenant:cluster:license:get <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:cluster:license:get 1"]
    },
    {
      name: "tenant:cluster:license:set",
      description: "Set cluster kubeconfig",
      usage: "xano tenant:cluster:license:set <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID" }],
      flags: [
        { name: "file", type: "string", required: false, description: "Path to kubeconfig.yaml" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: ["xano tenant:cluster:license:set 1 --file ./kubeconfig.yaml"]
    }
  ],

  workflows: [
    {
      name: "Deploy Release to Tenant",
      description: "Create a release and deploy it to a tenant",
      steps: [
        "Create a release from a branch: `xano release:create -n v1.0.0 -b dev`",
        "Deploy to tenant: `xano tenant:deploy_release my-tenant -r v1.0.0`",
        "Verify tenant: `xano tenant:get my-tenant`"
      ],
      example: `xano release:create -n v1.0.0 -b dev
xano tenant:deploy_release my-tenant -r v1.0.0
xano tenant:get my-tenant`
    },
    {
      name: "Tenant Environment Setup",
      description: "Create a tenant and configure its environment",
      steps: [
        'Create tenant: `xano tenant:create "My Tenant"`',
        "Set environment variables: `xano tenant:env:set my-tenant -n DB_HOST --value db.example.com`",
        "Set more vars: `xano tenant:env:set my-tenant -n API_KEY --value sk-123`",
        "Deploy a release: `xano tenant:deploy_release my-tenant -r v1.0.0`",
        "Verify env: `xano tenant:env:list my-tenant`"
      ],
      example: `xano tenant:create "My Tenant"
xano tenant:env:set my-tenant -n DB_HOST --value db.example.com
xano tenant:env:set my-tenant -n API_KEY --value sk-123
xano tenant:deploy_release my-tenant -r v1.0.0`
    },
    {
      name: "Backup and Restore",
      description: "Create, export, and restore tenant backups",
      steps: [
        "Create a backup: `xano tenant:backup:create my-tenant`",
        "List backups: `xano tenant:backup:list my-tenant`",
        "Export backup: `xano tenant:backup:export my-tenant --backup_id 123 --output ./backup.tar.gz`",
        "Restore if needed: `xano tenant:backup:restore my-tenant --backup_id 123`"
      ],
      example: `xano tenant:backup:create my-tenant
xano tenant:backup:list my-tenant
xano tenant:backup:export my-tenant --backup_id 123 --output ./backup.tar.gz

# To restore:
xano tenant:backup:restore my-tenant --backup_id 123`
    }
  ]
};

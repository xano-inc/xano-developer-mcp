import type { TopicDoc } from "../types.js";

export const tenantDoc: TopicDoc = {
  topic: "tenant",
  title: "Xano CLI - Tenant Management",
  description: `Tenant commands let you manage tenants in a Xano workspace. Tenants are isolated deployment targets for multi-tenant and white-label applications. Each tenant has its own database, environment variables, and configuration.

## Key Concepts

- **Tenant**: An isolated deployment instance within a workspace, identified by name.
- **Cluster**: Infrastructure where tenants run (standard or run type).
- **Deployments**: Tenants receive updates via named releases or platform versions.
- **Environment variables**: Managed per-tenant for configuration isolation.
- **Backups**: Per-tenant backup and restore for disaster recovery.
- **Pull**: Read-only export of tenant contents (same multidoc format as \`workspace pull\`).
- **Push**: Direct tenant push is NOT supported. Use a release deployment or the sandbox workflow instead.

## Tenant Identification

Tenants are identified by their **name** (not numeric IDs).`,

  ai_hints: `**Key concepts:**
- Tenants are deployment targets for multi-tenant/white-label applications
- Each tenant is isolated with its own database, env vars, and configuration
- \`tenant pull\` exports tenant contents (like \`workspace pull\` but tenant-scoped)
- Direct \`tenant push\` is blocked — deploy via releases or use the sandbox
- Deployments use named releases (\`tenant deploy_release\`) or platform versions (\`tenant deploy_platform\`)
- Environment variables are managed per-tenant for configuration isolation
- Backups provide disaster recovery per-tenant
- Clusters manage the infrastructure where tenants run

**Typical workflow:**
1. Create a tenant: \`xano tenant create "My Tenant"\`
2. Set environment variables: \`xano tenant env set my-tenant -n API_KEY --value secret\`
3. Deploy a release: \`xano tenant deploy_release my-tenant -r v1.0.0\`

**Tenant operations overview:**
- CRUD: create, get, list, edit, delete
- Code export: pull (read-only)
- Deployment: deploy_release, deploy_platform
- Configuration: env list, env get, env set, env delete, env get_all, env set_all
- Backups: backup create, backup list, backup export, backup import, backup restore, backup delete
- Infrastructure: cluster create, cluster list, cluster get, cluster edit, cluster delete, cluster license get, cluster license set
- License: license get, license set
- Testing: unit_test list/run/run_all, workflow_test list/run/run_all
- Access: impersonate (open tenant in browser)`,

  related_topics: ["sandbox", "workspace", "release", "branch"],

  commands: [
    // Core CRUD
    {
      name: "tenant list",
      description: "List all tenants in a workspace",
      usage: "xano tenant list [options]",
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant list", "xano tenant list -o json"]
    },
    {
      name: "tenant get",
      description: "Get details for a specific tenant",
      usage: "xano tenant get <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant get my-tenant", "xano tenant get my-tenant -o json"]
    },
    {
      name: "tenant create",
      description: "Create a new tenant",
      usage: "xano tenant create <display> [options]",
      args: [{ name: "display", required: true, description: "Display name for the tenant" }],
      flags: [
        { name: "description", short: "d", type: "string", required: false, description: "Tenant description" },
        { name: "type", type: "string", required: false, default: "tier1", description: "Tenant type: tier1, tier2, or tier3" },
        { name: "cluster_id", type: "integer", required: false, description: "Cluster ID to deploy to (required for tier2/tier3)" },
        { name: "platform_id", type: "integer", required: false, description: "Platform ID to use" },
        { name: "license", short: "l", type: "string", required: false, description: "Path to a license override file to apply during creation" },
        { name: "domain", type: "string", required: false, description: "Custom domain for the tenant" },
        { name: "ingress", type: "boolean", required: false, default: "true", description: "Enable ingress (--no-ingress to disable)" },
        { name: "tasks", type: "boolean", required: false, default: "true", description: "Enable background tasks (--no-tasks to disable)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        'xano tenant create "My Tenant"',
        'xano tenant create "Production" -d "Production tenant" --type tier2 --cluster_id 1',
        'xano tenant create "Staging" --type tier2 --cluster_id 1 --license ./license.yaml'
      ]
    },
    {
      name: "tenant edit",
      description: "Edit an existing tenant",
      usage: "xano tenant edit <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "display", type: "string", required: false, description: "New display name" },
        { name: "description", short: "d", type: "string", required: false, description: "New description" },
        { name: "domain", type: "string", required: false, description: "Custom domain" },
        { name: "proxy", type: "string", required: false, description: "Proxy URL" },
        { name: "ingress", type: "boolean", required: false, description: "Enable/disable ingress (--no-ingress)" },
        { name: "tasks", type: "boolean", required: false, description: "Enable/disable background tasks (--no-tasks)" },
        { name: "rbac", type: "boolean", required: false, description: "Enable/disable RBAC (--no-rbac)" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ['xano tenant edit my-tenant --display "New Name"', "xano tenant edit my-tenant --no-tasks"]
    },
    {
      name: "tenant delete",
      description: "Delete a tenant",
      usage: "xano tenant delete <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant delete old-tenant", "xano tenant delete old-tenant --force"]
    },
    {
      name: "tenant impersonate",
      description: "Open tenant dashboard in browser",
      usage: "xano tenant impersonate <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "url-only", short: "u", type: "boolean", required: false, description: "Print the URL without opening the browser" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: [
        "xano tenant impersonate my-tenant",
        "xano tenant impersonate my-tenant --url-only",
        "xano tenant impersonate my-tenant -o json"
      ]
    },
    // Pull (push is blocked)
    {
      name: "tenant pull",
      description: "Pull tenant contents to local files (same multidoc format as workspace pull)",
      usage: "xano tenant pull -t <tenant_name> [options]",
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name to pull from" },
        { name: "directory", short: "d", type: "string", required: false, default: ".", description: "Output directory for pulled documents" },
        { name: "env", type: "boolean", required: false, description: "Include environment variables" },
        { name: "records", type: "boolean", required: false, description: "Include records" },
        { name: "draft", type: "boolean", required: false, description: "Include draft versions" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (optional if set in profile)" }
      ],
      examples: [
        "xano tenant pull -t my-tenant -d ./tenant-code",
        "xano tenant pull -t my-tenant -d ./backup --env --records"
      ]
    },
    {
      name: "tenant push",
      description: "DEPRECATED: Direct tenant push is not supported. Deploy through a release (`xano tenant deploy_release`) or use the sandbox (`xano sandbox push`).",
      usage: "xano tenant push  # errors out",
      examples: [
        "# Instead of pushing directly, deploy via release:",
        "xano release create -n v1.0.0 -b dev",
        "xano tenant deploy_release my-tenant -r v1.0.0"
      ]
    },
    // Deployments
    {
      name: "tenant deploy_release",
      description: "Deploy a named release to a tenant",
      usage: "xano tenant deploy_release <tenant_name> --release <name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "release", short: "r", type: "string", required: true, description: "Release name to deploy" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano tenant deploy_release my-tenant -r v1.0.0",
        "xano tenant deploy_release production --release v2.0.0"
      ]
    },
    {
      name: "tenant deploy_platform",
      description: "Deploy a platform version to a tenant",
      usage: "xano tenant deploy_platform <tenant_name> --platform_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "platform_id", type: "integer", required: true, description: "Platform version ID to deploy" },
        { name: "license", short: "l", type: "string", required: false, description: "Path to a license override file to apply after deploy" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant deploy_platform my-tenant --platform_id 5"]
    },
    // Environment Variables
    {
      name: "tenant env list",
      description: "List environment variable keys for a tenant",
      usage: "xano tenant env list <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant env list my-tenant"]
    },
    {
      name: "tenant env get",
      description: "Get a single environment variable",
      usage: "xano tenant env get <tenant_name> --name <key> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Environment variable name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant env get my-tenant -n API_KEY"]
    },
    {
      name: "tenant env set",
      description: "Set an environment variable",
      usage: "xano tenant env set <tenant_name> --name <key> --value <val> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Environment variable name" },
        { name: "value", type: "string", required: true, description: "Environment variable value" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant env set my-tenant -n API_KEY --value sk-123"]
    },
    {
      name: "tenant env delete",
      description: "Delete an environment variable",
      usage: "xano tenant env delete <tenant_name> --name <key> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Environment variable name" },
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant env delete my-tenant -n OLD_KEY --force"]
    },
    {
      name: "tenant env get_all",
      description: "Export all environment variables to a YAML file (or stdout with --view)",
      usage: "xano tenant env get_all <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Output file path (default: env_<tenant_name>.yaml)" },
        { name: "view", type: "boolean", required: false, description: "Print environment variables to stdout instead of saving to file" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano tenant env get_all my-tenant",
        "xano tenant env get_all my-tenant -f ./env.yaml",
        "xano tenant env get_all my-tenant --view"
      ]
    },
    {
      name: "tenant env set_all",
      description: "Import all environment variables from a YAML file",
      usage: "xano tenant env set_all <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to env file (default: env_<tenant_name>.yaml)" },
        { name: "clean", type: "boolean", required: false, description: "Remove the source file after successful upload" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano tenant env set_all my-tenant -f ./env.yaml",
        "xano tenant env set_all my-tenant -f ./env.yaml --clean"
      ]
    },
    // Backups
    {
      name: "tenant backup list",
      description: "List backups for a tenant",
      usage: "xano tenant backup list <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "page", type: "integer", required: false, default: "1", description: "Page number for pagination" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant backup list my-tenant"]
    },
    {
      name: "tenant backup create",
      description: "Create a backup of a tenant",
      usage: "xano tenant backup create <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "description", short: "d", type: "string", required: false, description: "Backup description" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant backup create my-tenant", 'xano tenant backup create my-tenant -d "pre-deploy snapshot"']
    },
    {
      name: "tenant backup export",
      description: "Download a backup file",
      usage: "xano tenant backup export <tenant_name> --backup_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "backup_id", type: "integer", required: true, description: "Backup ID to export" },
        { name: "output", type: "string", required: false, description: "Output file path (defaults to ./tenant-{name}-backup-{backup_id}.tar.gz)" },
        { name: "format", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" }
      ],
      examples: ["xano tenant backup export my-tenant --backup_id 123 --output ./backup.tar.gz"]
    },
    {
      name: "tenant backup import",
      description: "Import a backup file into a tenant",
      usage: "xano tenant backup import <tenant_name> --file <path> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", short: "f", type: "string", required: true, description: "Path to the backup file (.tar.gz)" },
        { name: "description", short: "d", type: "string", required: false, description: "Backup description" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant backup import my-tenant -f ./backup.tar.gz"]
    },
    {
      name: "tenant backup restore",
      description: "Restore a tenant from a backup",
      usage: "xano tenant backup restore <tenant_name> --backup_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "backup_id", type: "integer", required: true, description: "Backup ID to restore from" },
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant backup restore my-tenant --backup_id 123 --force"]
    },
    {
      name: "tenant backup delete",
      description: "Delete a backup",
      usage: "xano tenant backup delete <tenant_name> --backup_id <id> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "backup_id", type: "integer", required: true, description: "Backup ID to delete" },
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant backup delete my-tenant --backup_id 123 --force"]
    },
    // License
    {
      name: "tenant license get",
      description: "Get tenant license (YAML file by default, or stdout with --view)",
      usage: "xano tenant license get <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Output file path (default: license_<tenant_name>.yaml)" },
        { name: "view", type: "boolean", required: false, description: "Print license to stdout instead of saving to file" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant license get my-tenant", "xano tenant license get my-tenant --view"]
    },
    {
      name: "tenant license set",
      description: "Set/update the license for a tenant (from file or inline value)",
      usage: "xano tenant license set <tenant_name> [options]",
      args: [{ name: "tenant_name", required: true, description: "Tenant name" }],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to license file (default: license_<tenant_name>.yaml). Exclusive with --value." },
        { name: "value", type: "string", required: false, description: "Inline license value. Exclusive with --file/--clean." },
        { name: "clean", type: "boolean", required: false, description: "Remove the source file after successful upload. Exclusive with --value." },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano tenant license set my-tenant -f ./license.yaml",
        "xano tenant license set my-tenant --value tier2"
      ]
    },
    // Clusters
    {
      name: "tenant cluster list",
      description: "List all clusters",
      usage: "xano tenant cluster list [options]",
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant cluster list", "xano tenant cluster list -o json"]
    },
    {
      name: "tenant cluster get",
      description: "Get cluster details",
      usage: "xano tenant cluster get <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID (integer)" }],
      flags: [
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant cluster get 1"]
    },
    {
      name: "tenant cluster create",
      description: "Create a new cluster",
      usage: "xano tenant cluster create --name <name> [options]",
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Cluster name" },
        { name: "type", type: "string", required: false, default: "standard", description: "Cluster type: standard or run" },
        { name: "description", short: "d", type: "string", required: false, description: "Cluster description" },
        { name: "domain", type: "string", required: false, description: "Custom domain for the cluster" },
        { name: "credentials", type: "string", required: false, description: "Kubeconfig credentials (raw text). Mutually exclusive with --credentials_file." },
        { name: "credentials_file", type: "string", required: false, description: "Path to kubeconfig credentials file. Mutually exclusive with --credentials." },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        'xano tenant cluster create -n "Production Cluster"',
        'xano tenant cluster create -n "K8s Cluster" --credentials_file ./kubeconfig.yaml'
      ]
    },
    {
      name: "tenant cluster edit",
      description: "Edit a cluster. All editable fields are required on this command.",
      usage: "xano tenant cluster edit <cluster_id> --name <n> --description <d> --domain <domain> --type <t> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID (integer)" }],
      flags: [
        { name: "name", short: "n", type: "string", required: true, description: "Cluster name" },
        { name: "description", short: "d", type: "string", required: true, description: "Cluster description" },
        { name: "domain", type: "string", required: true, description: "Custom domain" },
        { name: "type", type: "string", required: true, description: "Cluster type: standard or run" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ['xano tenant cluster edit 1 -n "Updated" -d "desc" --domain example.com --type standard']
    },
    {
      name: "tenant cluster delete",
      description: "Delete a cluster",
      usage: "xano tenant cluster delete <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID (integer)" }],
      flags: [
        { name: "force", short: "f", type: "boolean", required: false, description: "Skip confirmation prompt" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant cluster delete 1 --force"]
    },
    {
      name: "tenant cluster license get",
      description: "Get cluster kubeconfig (saved to file by default, or stdout with --view)",
      usage: "xano tenant cluster license get <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID (integer)" }],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Output file path (default: kubeconfig_<cluster_id>.yaml)" },
        { name: "view", type: "boolean", required: false, description: "Print license to stdout instead of saving to file" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant cluster license get 1", "xano tenant cluster license get 1 --view"]
    },
    {
      name: "tenant cluster license set",
      description: "Set cluster kubeconfig (from file or inline value)",
      usage: "xano tenant cluster license set <cluster_id> [options]",
      args: [{ name: "cluster_id", required: true, description: "Cluster ID (integer)" }],
      flags: [
        { name: "file", short: "f", type: "string", required: false, description: "Path to kubeconfig file (default: kubeconfig_<cluster_id>.yaml). Mutually exclusive with --value." },
        { name: "value", type: "string", required: false, description: "Inline kubeconfig YAML value. Mutually exclusive with --file and --clean." },
        { name: "clean", type: "boolean", required: false, description: "Remove the source file after successful upload. Mutually exclusive with --value." },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant cluster license set 1 -f ./kubeconfig.yaml"]
    },
    // Tenant-scoped testing
    {
      name: "tenant unit_test list",
      description: "List unit tests in a tenant",
      usage: "xano tenant unit_test list -t <tenant_name> [options]",
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch name" },
        { name: "obj-type", type: "string", required: false, description: "Filter by object type: function, query, middleware" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant unit_test list -t my-tenant", "xano tenant unit_test list -t my-tenant --branch dev"]
    },
    {
      name: "tenant unit_test run",
      description: "Run a single unit test in a tenant",
      usage: "xano tenant unit_test run <unit_test_id> -t <tenant_name> [options]",
      args: [{ name: "unit_test_id", required: true, description: "ID of the unit test to run" }],
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant unit_test run 123 -t my-tenant"]
    },
    {
      name: "tenant unit_test run_all",
      description: "Run all unit tests in a tenant",
      usage: "xano tenant unit_test run_all -t <tenant_name> [options]",
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch name" },
        { name: "obj-type", type: "string", required: false, description: "Filter by object type: function, query, middleware" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant unit_test run_all -t my-tenant", "xano tenant unit_test run_all -t my-tenant --branch dev -o json"]
    },
    {
      name: "tenant workflow_test list",
      description: "List workflow tests in a tenant",
      usage: "xano tenant workflow_test list -t <tenant_name> [options]",
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant workflow_test list -t my-tenant"]
    },
    {
      name: "tenant workflow_test run",
      description: "Run a single workflow test in a tenant",
      usage: "xano tenant workflow_test run <workflow_test_id> -t <tenant_name> [options]",
      args: [{ name: "workflow_test_id", required: true, description: "ID of the workflow test to run (integer)" }],
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant workflow_test run 456 -t my-tenant"]
    },
    {
      name: "tenant workflow_test run_all",
      description: "Run all workflow tests in a tenant",
      usage: "xano tenant workflow_test run_all -t <tenant_name> [options]",
      flags: [
        { name: "tenant", short: "t", type: "string", required: true, description: "Tenant name" },
        { name: "branch", short: "b", type: "string", required: false, description: "Filter by branch name" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID (uses profile workspace if not provided)" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: ["xano tenant workflow_test run_all -t my-tenant --branch dev -o json"]
    }
  ],

  workflows: [
    {
      name: "Deploy Release to Tenant",
      description: "Create a release and deploy it to a tenant",
      steps: [
        "Create a release from a branch: `xano release create -n v1.0.0 -b dev`",
        "Deploy to tenant: `xano tenant deploy_release my-tenant -r v1.0.0`",
        "Verify tenant: `xano tenant get my-tenant`"
      ],
      example: `xano release create -n v1.0.0 -b dev
xano tenant deploy_release my-tenant -r v1.0.0
xano tenant get my-tenant`
    },
    {
      name: "Tenant Environment Setup",
      description: "Create a tenant and configure its environment",
      steps: [
        'Create tenant: `xano tenant create "My Tenant"`',
        "Set environment variables: `xano tenant env set my-tenant -n DB_HOST --value db.example.com`",
        "Set more vars: `xano tenant env set my-tenant -n API_KEY --value sk-123`",
        "Deploy a release: `xano tenant deploy_release my-tenant -r v1.0.0`",
        "Verify env: `xano tenant env list my-tenant`"
      ],
      example: `xano tenant create "My Tenant"
xano tenant env set my-tenant -n DB_HOST --value db.example.com
xano tenant env set my-tenant -n API_KEY --value sk-123
xano tenant deploy_release my-tenant -r v1.0.0`
    },
    {
      name: "Backup and Restore",
      description: "Create, export, and restore tenant backups",
      steps: [
        "Create a backup: `xano tenant backup create my-tenant`",
        "List backups: `xano tenant backup list my-tenant`",
        "Export backup: `xano tenant backup export my-tenant --backup_id 123 --output ./backup.tar.gz`",
        "Restore if needed: `xano tenant backup restore my-tenant --backup_id 123`"
      ],
      example: `xano tenant backup create my-tenant
xano tenant backup list my-tenant
xano tenant backup export my-tenant --backup_id 123 --output ./backup.tar.gz

# To restore:
xano tenant backup restore my-tenant --backup_id 123 --force`
    },
    {
      name: "Run Tenant Tests in CI",
      description: "Run unit and workflow tests against a specific tenant",
      steps: [
        "Run all unit tests: `xano tenant unit_test run_all -t my-tenant -o json`",
        "Run all workflow tests: `xano tenant workflow_test run_all -t my-tenant -o json`"
      ],
      example: `xano tenant unit_test run_all -t my-tenant -o json
xano tenant workflow_test run_all -t my-tenant -o json`
    }
  ]
};

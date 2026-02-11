import type { TopicDoc } from "../types.js";

export const branchDoc: TopicDoc = {
  topic: "branch",
  title: "Branch Management",
  description: `Branches provide environment separation for your Xano workspace. Use branches for development, staging, and production environments.

## Key Concepts
- Default branch is "v1" (cannot be deleted or renamed)
- Branches contain separate databases and configurations
- One branch is designated as "live" (production)
- Create branches by cloning from existing branches
- Useful for safe development without affecting production

## Common Workflow
1. Create a development branch by cloning from "v1"
2. Make and test changes on the dev branch
3. Set the dev branch as live when ready
4. Or merge changes back to production manually`,

  ai_hints: `- Cannot delete the "v1" branch or the live branch
- Cannot update/rename the "v1" branch label
- Use "v1" as the source_branch when cloning from the default branch
- The "live" property indicates which branch is active for API requests
- "backup" property indicates if branch was created as a backup
- Always verify branch before making changes (dev vs prod)`,

  endpoints: [
    {
      method: "GET",
      path: "/workspace/{workspace_id}/branch",
      tool_name: "listBranches",
      description: "List all branches in a workspace including the default 'v1' branch.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ]
    },
    {
      method: "GET",
      path: "/workspace/{workspace_id}/branch/{branch_label}",
      tool_name: "getBranch",
      description: "Retrieve details for a specific branch by label. Use 'v1' for the default branch.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "branch_label", type: "string", required: true, in: "path", description: "Branch label (use 'v1' for default branch)" }
      ]
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/branch",
      tool_name: "createBranch",
      description: "Create a new branch by cloning from an existing branch. Use 'v1' as source_branch for the default branch.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" }
      ],
      request_body: {
        type: "object",
        properties: {
          source_branch: { type: "string", description: "Label of the branch to clone from. Defaults to 'v1'", required: false },
          label: { type: "string", description: "Label for the new branch", required: true },
          description: { type: "string", description: "Description for the new branch", required: false },
          color: { type: "string", description: "Color hex code for the branch (e.g., '#ebc346')", required: false }
        },
        example: {
          source_branch: "v1",
          label: "feature-branch",
          description: "A new feature branch",
          color: "#ebc346"
        }
      }
    },
    {
      method: "PUT",
      path: "/workspace/{workspace_id}/branch/{branch_label}",
      tool_name: "updateBranch",
      description: "Update an existing branch's label, description, or color. Cannot update the default 'v1' branch label.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "branch_label", type: "string", required: true, in: "path", description: "Current label of the branch to update" }
      ],
      request_body: {
        type: "object",
        properties: {
          label: { type: "string", description: "New label for the branch", required: false },
          description: { type: "string", description: "New description for the branch", required: false },
          color: { type: "string", description: "New color hex code for the branch", required: false }
        },
        example: {
          label: "updated-branch",
          description: "Updated description",
          color: "#ff5733"
        }
      }
    },
    {
      method: "POST",
      path: "/workspace/{workspace_id}/branch/{branch_label}/live",
      tool_name: "setBranchLive",
      description: "Set a branch as the live (active) branch for the workspace. The live branch is the default branch used for API requests.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "branch_label", type: "string", required: true, in: "path", description: "Label of the branch to set as live (use 'v1' for default)" }
      ]
    },
    {
      method: "DELETE",
      path: "/workspace/{workspace_id}/branch/{branch_label}",
      tool_name: "deleteBranch",
      description: "Delete a branch. Cannot delete the 'v1' branch or the currently live branch.",
      parameters: [
        { name: "workspace_id", type: "integer", required: true, in: "path", description: "Workspace ID" },
        { name: "branch_label", type: "string", required: true, in: "path", description: "Branch label/name to delete" }
      ]
    }
  ],

  schemas: {
    Branch: {
      type: "object",
      properties: {
        created_at: { type: "string", format: "date-time", description: "When the branch was created" },
        label: { type: "string", description: "Branch identifier (e.g., 'v1', 'dev')" },
        backup: { type: "boolean", description: "Whether this branch was created as a backup" },
        live: { type: "boolean", description: "Whether this is the live/production branch" }
      }
    }
  },

  examples: [
    {
      title: "List all branches",
      description: "Get all branches in a workspace",
      request: {
        method: "GET",
        path: "/workspace/1/branch",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: [
        { created_at: "2024-01-15T10:30:00Z", label: "v1", backup: false, live: true },
        { created_at: "2024-02-01T14:20:00Z", label: "dev", backup: false, live: false },
        { created_at: "2024-02-10T09:15:00Z", label: "staging", backup: false, live: false }
      ]
    },
    {
      title: "Get a specific branch",
      description: "Retrieve details for a single branch",
      request: {
        method: "GET",
        path: "/workspace/1/branch/dev",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: {
        created_at: "2024-02-01T14:20:00Z",
        label: "dev",
        backup: false,
        live: false
      }
    },
    {
      title: "Create a new branch",
      description: "Clone from v1 to create a development branch",
      request: {
        method: "POST",
        path: "/workspace/1/branch",
        headers: { "Authorization": "Bearer <token>" },
        body: {
          source_branch: "v1",
          label: "feature-auth",
          description: "Authentication feature development",
          color: "#ebc346"
        }
      },
      response: {
        created_at: "2024-02-11T10:00:00Z",
        label: "feature-auth",
        backup: false,
        live: false
      }
    },
    {
      title: "Update a branch",
      description: "Rename a branch and update its color",
      request: {
        method: "PUT",
        path: "/workspace/1/branch/feature-auth",
        headers: { "Authorization": "Bearer <token>" },
        body: {
          label: "feature-authentication",
          color: "#ff5733"
        }
      },
      response: {
        created_at: "2024-02-11T10:00:00Z",
        label: "feature-authentication",
        backup: false
      }
    },
    {
      title: "Set branch as live",
      description: "Make a branch the active production branch",
      request: {
        method: "POST",
        path: "/workspace/1/branch/staging/live",
        headers: { "Authorization": "Bearer <token>" }
      },
      response: {
        created_at: "2024-02-10T09:15:00Z",
        label: "staging",
        backup: false,
        live: true
      }
    }
  ],

  related_topics: ["workspace", "table"]
};

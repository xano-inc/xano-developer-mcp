import type { TopicDoc } from "../types.js";

export const branchDoc: TopicDoc = {
  topic: "branch",
  title: "Branch Management",
  description: `Branches provide environment separation for your Xano workspace. Use branches for development, staging, and production environments.

## Key Concepts
- Default branch is "v1" (cannot be deleted)
- Branches contain separate databases and configurations
- One branch is designated as "live" (production)
- Useful for safe development without affecting production
- Import schema to create new branches from exports

## Common Workflow
1. Create a development branch
2. Make and test changes on dev branch
3. Export schema from dev
4. Import schema to production branch`,

  ai_hints: `- Cannot delete the "v1" branch or the live branch
- Use branch parameter in list endpoints to filter by branch
- Import schema creates a new branch from export file
- Always verify branch before making changes (dev vs prod)
- Export before major changes for backup`,

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
      method: "DELETE",
      path: "/workspace/{workspace_id}/branch/{branch_label}",
      tool_name: "deleteBranch",
      description: "Delete a branch. Cannot delete 'v1' or the live branch.",
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
        label: { type: "string", description: "Branch identifier (e.g., 'v1', 'dev')" },
        is_live: { type: "boolean", description: "Whether this is the live/production branch" },
        created_at: { type: "string", format: "date-time" }
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
      response: {
        items: [
          { label: "v1", is_live: true },
          { label: "dev", is_live: false },
          { label: "staging", is_live: false }
        ]
      }
    }
  ],

  related_topics: ["workspace", "table"]
};

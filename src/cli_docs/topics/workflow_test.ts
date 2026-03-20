import type { TopicDoc } from "../types.js";

export const workflowTestDoc: TopicDoc = {
  topic: "workflow_test",
  title: "Xano CLI - Workflow Test Management",
  description: `Workflow test commands let you run end-to-end tests that exercise multi-step workflows. Unlike unit tests which test individual functions, workflow tests validate complete request flows.

## Key Concepts

- **Workflow tests** are more comprehensive than unit tests, testing full request flows.
- Tests are created and configured in the Xano dashboard; the CLI is for listing, viewing, and running them.
- The \`get\` command supports \`xs\` output format for viewing test XanoScript.
- Use \`run_all\` in CI/CD pipelines for automated end-to-end validation.`,

  ai_hints: `**Key concepts:**
- Workflow tests are more comprehensive than unit tests, testing full request flows
- Tests are created in the Xano dashboard; the CLI is for running them
- \`workflow_test:get\` supports \`xs\` output format for viewing test XanoScript
- Use \`workflow_test:run_all\` in CI/CD pipelines for automated testing

**CI/CD integration:**
- Use \`workflow_test:run_all -o json\` for machine-readable output
- Combine with \`unit_test:run_all\` for full test coverage
- Filter by branch with \`--branch\` to test specific branches

**Viewing test details:**
- Use \`workflow_test:get <id> -o xs\` to view the test XanoScript
- Use \`--include-draft\` to view draft versions of tests`,

  related_topics: ["unit_test", "workspace", "branch"],

  commands: [
    {
      name: "workflow_test:list",
      description: "List workflow tests in the workspace",
      usage: "xano workflow_test:list [options]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Branch to list tests from" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workflow_test:list",
        "xano workflow_test:list --branch dev",
        "xano workflow_test:list -o json"
      ]
    },
    {
      name: "workflow_test:get",
      description: "Get details for a specific workflow test",
      usage: "xano workflow_test:get <workflow_test_id> [options]",
      args: [
        { name: "workflow_test_id", required: true, description: "ID of the workflow test to retrieve" }
      ],
      flags: [
        { name: "include-draft", type: "boolean", required: false, description: "Include draft version if available" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: xs or json" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano workflow_test:get 456",
        "xano workflow_test:get 456 -o xs",
        "xano workflow_test:get 456 --include-draft -o json"
      ]
    },
    {
      name: "workflow_test:run",
      description: "Run a single workflow test by ID",
      usage: "xano workflow_test:run <workflow_test_id> [options]",
      args: [
        { name: "workflow_test_id", required: true, description: "ID of the workflow test to run" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workflow_test:run 456",
        "xano workflow_test:run 456 -o json"
      ]
    },
    {
      name: "workflow_test:run_all",
      description: "Run all workflow tests in the workspace",
      usage: "xano workflow_test:run_all [options]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Branch to run tests against" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano workflow_test:run_all",
        "xano workflow_test:run_all --branch dev -o json"
      ]
    },
    {
      name: "workflow_test:delete",
      description: "Delete a workflow test by ID",
      usage: "xano workflow_test:delete <workflow_test_id> [options]",
      args: [
        { name: "workflow_test_id", required: true, description: "ID of the workflow test to delete" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" }
      ],
      examples: [
        "xano workflow_test:delete 456"
      ]
    }
  ],

  workflows: [
    {
      name: "Validate Workflows Before Deploy",
      description: "Run all workflow tests to validate before deployment",
      steps: [
        "List available tests: `xano workflow_test:list`",
        "Run all tests: `xano workflow_test:run_all`",
        "Check results for PASS/FAIL status"
      ],
      example: `xano workflow_test:list
xano workflow_test:run_all -o json`
    }
  ]
};

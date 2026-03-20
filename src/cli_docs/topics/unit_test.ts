import type { TopicDoc } from "../types.js";

export const unitTestDoc: TopicDoc = {
  topic: "unit_test",
  title: "Xano CLI - Unit Test Management",
  description: `Unit test commands let you run automated tests on individual Xano functions and endpoints. Tests validate that your functions produce expected outputs for given inputs.

## Key Concepts

- **Unit tests** are created and configured in the Xano dashboard, not via the CLI.
- The CLI is used to **list and run** tests, making it ideal for CI/CD pipelines.
- Test output shows PASS/FAIL status with error details for failed tests.
- Use \`--obj-type\` to filter tests by object type (e.g., function, API endpoint).
- Use \`--branch\` to run tests against a specific branch.`,

  ai_hints: `**Key concepts:**
- Unit tests are created in the Xano dashboard; the CLI is for running them
- Use \`unit_test:run_all\` in CI/CD pipelines for automated testing
- Output shows PASS/FAIL with error details for each test
- \`--obj-type\` filters tests by object type (e.g., function, API endpoint)
- \`--branch\` specifies which branch to test against

**CI/CD integration:**
- Use \`unit_test:run_all -o json\` for machine-readable output
- Combine with \`workflow_test:run_all\` for full test coverage
- Filter by branch with \`--branch\` to test specific branches`,

  related_topics: ["workflow_test", "workspace", "function"],

  commands: [
    {
      name: "unit_test:list",
      description: "List unit tests in the workspace",
      usage: "xano unit_test:list [options]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Branch to list tests from" },
        { name: "obj-type", type: "string", required: false, description: "Filter by object type" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano unit_test:list",
        "xano unit_test:list --branch dev",
        "xano unit_test:list --obj-type function -o json"
      ]
    },
    {
      name: "unit_test:run",
      description: "Run a single unit test by ID",
      usage: "xano unit_test:run <unit_test_id> [options]",
      args: [
        { name: "unit_test_id", required: true, description: "ID of the unit test to run" }
      ],
      flags: [
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano unit_test:run 123",
        "xano unit_test:run 123 -o json"
      ]
    },
    {
      name: "unit_test:run_all",
      description: "Run all unit tests in the workspace",
      usage: "xano unit_test:run_all [options]",
      flags: [
        { name: "branch", short: "b", type: "string", required: false, description: "Branch to run tests against" },
        { name: "obj-type", type: "string", required: false, description: "Filter by object type" },
        { name: "workspace", short: "w", type: "string", required: false, description: "Workspace ID" },
        { name: "output", short: "o", type: "string", required: false, default: "summary", description: "Output format: summary or json" }
      ],
      examples: [
        "xano unit_test:run_all",
        "xano unit_test:run_all --branch dev -o json",
        "xano unit_test:run_all --obj-type function"
      ]
    }
  ],

  workflows: [
    {
      name: "Run Tests in CI/CD",
      description: "Run all unit tests as part of a CI/CD pipeline",
      steps: [
        "List available tests: `xano unit_test:list`",
        "Run all tests: `xano unit_test:run_all`",
        "Check output for PASS/FAIL results"
      ],
      example: `xano unit_test:list
xano unit_test:run_all -o json`
    }
  ]
};

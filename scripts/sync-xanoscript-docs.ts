#!/usr/bin/env npx ts-node

/**
 * Scans the local xanoscript_docs directory and outputs the docs mapping.
 *
 * Usage:
 *   npm run sync-docs
 *
 * This outputs TypeScript code that can be reviewed and copied into src/index.ts
 */

import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = join(__dirname, "..", "xanoscript_docs");

interface DocGroup {
  guideline?: string;
  examples?: string;
}

function scanDocs() {
  console.log("// ============================================================");
  console.log("// XanoScript Documentation Mapping");
  console.log(`// Generated from: ${DOCS_DIR}`);
  console.log(`// Generated at: ${new Date().toISOString()}`);
  console.log("// ============================================================\n");

  let files: string[];
  try {
    files = readdirSync(DOCS_DIR).filter(f => f.endsWith(".md"));
  } catch (error) {
    console.error(`Error: Could not read directory ${DOCS_DIR}`);
    console.error("Ensure the xanoscript_docs directory exists in the project root.");
    process.exit(1);
  }

  // Try to read version
  let version = "unknown";
  try {
    const versionFile = readFileSync(join(DOCS_DIR, "version.json"), "utf-8");
    version = JSON.parse(versionFile).version || "unknown";
  } catch {
    // ignore
  }
  console.log(`// Documentation version: ${version}\n`);

  const groups: Record<string, DocGroup> = {};
  const standalone: string[] = [];

  for (const file of files) {
    // Skip README
    if (file === "README.md") continue;

    // Pattern: {topic}_guideline.md, {topic}_examples.md
    const guidelineMatch = file.match(/^(.+)_guideline\.md$/);
    const examplesMatch = file.match(/^(.+)_examples\.md$/);

    if (guidelineMatch) {
      const topic = guidelineMatch[1];
      groups[topic] = groups[topic] || {};
      groups[topic].guideline = file;
    } else if (examplesMatch) {
      const topic = examplesMatch[1];
      groups[topic] = groups[topic] || {};
      groups[topic].examples = file;
    } else {
      standalone.push(file);
    }
  }

  // Output the mapping
  console.log("const XANOSCRIPT_DOCS: Record<string, string[]> = {");

  // Core concepts (have both guideline + examples)
  console.log("  // Core concepts (guideline + examples)");
  const coreTopics = Object.entries(groups)
    .filter(([_, group]) => group.guideline && group.examples)
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [topic, group] of coreTopics) {
    console.log(`  ${topic}: ["${group.guideline}", "${group.examples}"],`);
  }

  // Guideline-only topics
  const guidelineOnly = Object.entries(groups)
    .filter(([_, group]) => group.guideline && !group.examples)
    .sort(([a], [b]) => a.localeCompare(b));

  if (guidelineOnly.length > 0) {
    console.log("\n  // Guideline only");
    for (const [topic, group] of guidelineOnly) {
      console.log(`  ${topic}: ["${group.guideline}"],`);
    }
  }

  // Standalone files
  if (standalone.length > 0) {
    console.log("\n  // Standalone reference docs");
    for (const file of standalone.sort()) {
      // Create a sensible key name
      let key = file.replace(".md", "").toLowerCase();
      // Special case: functions.md is the syntax reference
      if (key === "functions") key = "syntax";
      console.log(`  ${key}: ["${file}"],`);
    }
  }

  console.log("};");

  // Output analysis
  console.log("\n// ============================================================");
  console.log("// Analysis");
  console.log("// ============================================================\n");

  console.log(`// Total files: ${files.length}`);
  console.log(`// Core topics (guideline + examples): ${coreTopics.length}`);
  console.log(`// Guideline only: ${guidelineOnly.length}`);
  console.log(`// Standalone: ${standalone.length}`);

  // Missing docs
  const missingExamples = Object.entries(groups)
    .filter(([_, group]) => group.guideline && !group.examples)
    .map(([topic]) => topic);

  const missingGuidelines = Object.entries(groups)
    .filter(([_, group]) => !group.guideline && group.examples)
    .map(([topic]) => topic);

  if (missingExamples.length > 0) {
    console.log(`\n// Topics with guideline but no examples: ${missingExamples.join(", ")}`);
  }

  if (missingGuidelines.length > 0) {
    console.log(`\n// Topics with examples but no guideline: ${missingGuidelines.join(", ")}`);
  }

  // List all files for reference
  console.log("\n// ============================================================");
  console.log("// All documentation files");
  console.log("// ============================================================");
  for (const file of files.sort()) {
    console.log(`// - ${file}`);
  }
}

scanDocs();

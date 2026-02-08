/**
 * Formatting utilities for Run API documentation output
 * Re-exports the shared formatter with Run API configuration
 */

import type { TopicDoc, DetailLevel } from "../meta_api_docs/types.js";
import {
  formatDocumentation as formatDoc,
  RUN_API_CONFIG,
} from "../meta_api_docs/format.js";

export function formatDocumentation(
  doc: TopicDoc,
  detailLevel: DetailLevel = "detailed",
  includeSchemas: boolean = true
): string {
  return formatDoc(doc, detailLevel, includeSchemas, RUN_API_CONFIG);
}

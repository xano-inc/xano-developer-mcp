/**
 * Type definitions for Xano CLI documentation
 */

export interface CommandDoc {
  name: string;
  description: string;
  usage: string;
  flags?: FlagDoc[];
  args?: ArgDoc[];
  examples?: string[];
}

export interface FlagDoc {
  name: string;
  short?: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

export interface ArgDoc {
  name: string;
  required?: boolean;
  description: string;
}

export interface WorkflowDoc {
  name: string;
  description: string;
  steps: string[];
  example?: string;
}

export interface TopicDoc {
  topic: string;
  title: string;
  description: string;
  commands?: CommandDoc[];
  workflows?: WorkflowDoc[];
  related_topics?: string[];
  ai_hints?: string;
}

export type DetailLevel = "overview" | "detailed" | "examples";

export interface CliDocsArgs {
  topic: string;
  detail_level?: DetailLevel;
}

/**
 * Type definitions for Xano Meta API documentation
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ParameterDoc {
  name: string;
  type: string;
  required?: boolean;
  default?: unknown;
  description: string;
  enum?: string[];
  in?: "path" | "query" | "header";
}

export interface RequestBodyDoc {
  type: string;
  description?: string;
  properties?: Record<string, {
    type: string;
    description?: string;
    required?: boolean;
  }>;
  example?: unknown;
}

export interface ResponseDoc {
  type: string;
  description?: string;
  properties?: Record<string, unknown>;
}

export interface RequestExampleDoc {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface EndpointDoc {
  method: HttpMethod;
  path: string;
  tool_name?: string;
  description: string;
  tags?: string[];
  parameters?: ParameterDoc[];
  request_body?: RequestBodyDoc;
  response?: ResponseDoc;
  example?: RequestExampleDoc;
}

export interface ExampleDoc {
  title: string;
  description: string;
  request: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response?: unknown;
}

export interface PatternDoc {
  name: string;
  description?: string;
  steps: string[];
  example?: string;
}

export interface TopicDoc {
  topic: string;
  title: string;
  description: string;
  endpoints?: EndpointDoc[];
  examples?: ExampleDoc[];
  related_topics?: string[];
  schemas?: Record<string, unknown>;
  patterns?: PatternDoc[];
  ai_hints?: string;
}

export type DetailLevel = "overview" | "detailed" | "examples";

export interface MetaApiDocsArgs {
  topic: string;
  detail_level?: DetailLevel;
  include_schemas?: boolean;
}

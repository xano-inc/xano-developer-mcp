/**
 * Template for init_workspace tool documentation
 * Edit this file to update the workspace initialization guide
 */
export interface ObjectTypeConfig {
    type: string;
    path: string;
    endpoint: string;
}
export declare function generateInitWorkspaceTemplate(objectTypes: ObjectTypeConfig[]): string;

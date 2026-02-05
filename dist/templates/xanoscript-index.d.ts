/**
 * Template for xanoscript_docs index documentation
 * Edit this file to update the XanoScript documentation index
 */
export interface XanoscriptIndexParams {
    version: string;
    aliasLookup: Record<string, string[]>;
}
export declare function generateXanoscriptIndexTemplate(params: XanoscriptIndexParams): string;

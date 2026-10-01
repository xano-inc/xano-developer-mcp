declare module "@xano/xanoscript-language-server/parser/parser.js" {
  interface ParserError {
    message: string;
    token?: {
      startOffset: number;
      endOffset: number;
    };
    name?: string;
  }

  interface Parser {
    errors: ParserError[];
    warnings: ParserError[];
    informations: ParserError[];
    hints: ParserError[];
  }

  export function xanoscriptParser(
    text: string,
    scheme?: string,
    preTokenized?: unknown
  ): Parser;
}

declare module "@xano/xanoscript-language-server/utils.js" {
  export function getSchemeFromContent(text: string): string;
}

declare module "@xano/xanoscript-language-server/parser/policy/catalogue.js" {
  export function setPolicyCatalogue(
    catalogue: unknown,
    options?: { source?: "live" | "snapshot"; generatedAt?: string | null }
  ): void;
}

declare module "@xano/xanoscript-language-server/parser/policy/catalogueSnapshot.js" {
  const catalogue: { generated_at: string; items: unknown[]; document?: unknown };
  export default catalogue;
}

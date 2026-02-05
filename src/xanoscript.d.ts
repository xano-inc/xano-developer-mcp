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

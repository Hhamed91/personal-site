type TokenType =
  | "keyword"
  | "identifier"
  | "string"
  | "number"
  | "operator"
  | "comma"
  | "paren"
  | "star"
  | "dot"
  | "semicolon";

type Token = {
  type: TokenType;
  value: string;
  line: number;
  column: number;
};

export type ValidationError = {
  message: string;
  line: number;
  column: number;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: ValidationError };

const KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "CROSS",
  "ON",
  "WHERE",
  "GROUP",
  "ORDER",
  "BY",
  "LIMIT",
  "AS",
  "DISTINCT",
]);

const CLAUSE_KEYWORDS = new Set(["WHERE", "GROUP", "ORDER", "LIMIT"]);

type TokenizeResult = { tokens: Token[]; error?: ValidationError };

function tokenizeSql(sql: string): TokenizeResult {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const advance = (count: number) => {
    for (let i = 0; i < count; i += 1) {
      const char = sql[index + i];
      if (char === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }
    }
    index += count;
  };

  while (index < sql.length) {
    const char = sql[index];

    if (char === " " || char === "\t" || char === "\r" || char === "\n") {
      advance(1);
      continue;
    }

    if (char === "-" && sql[index + 1] === "-") {
      while (index < sql.length && sql[index] !== "\n") {
        advance(1);
      }
      continue;
    }

    if (char === "/" && sql[index + 1] === "*") {
      const startLine = line;
      const startColumn = column;
      advance(2);
      let closed = false;
      while (index < sql.length) {
        if (sql[index] === "*" && sql[index + 1] === "/") {
          advance(2);
          closed = true;
          break;
        }
        advance(1);
      }
      if (!closed) {
        return {
          tokens: [],
          error: {
            message: "Unterminated block comment.",
            line: startLine,
            column: startColumn,
          },
        };
      }
      continue;
    }

    if (char === "'") {
      const startLine = line;
      const startColumn = column;
      let value = "'";
      advance(1);
      let closed = false;
      while (index < sql.length) {
        const current = sql[index];
        value += current;
        if (current === "'" && sql[index + 1] === "'") {
          value += "'";
          advance(2);
          continue;
        }
        if (current === "'") {
          advance(1);
          closed = true;
          break;
        }
        advance(1);
      }
      if (!closed) {
        return {
          tokens: [],
          error: {
            message: "Unterminated string literal.",
            line: startLine,
            column: startColumn,
          },
        };
      }
      tokens.push({ type: "string", value, line: startLine, column: startColumn });
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      const startLine = line;
      const startColumn = column;
      let value = "";
      while (index < sql.length && /[A-Za-z0-9_$]/.test(sql[index])) {
        value += sql[index];
        advance(1);
      }
      if (sql[index] === ".") {
        while (index < sql.length && /[A-Za-z0-9_$.]/.test(sql[index])) {
          value += sql[index];
          advance(1);
        }
      }
      const upper = value.toUpperCase();
      tokens.push({
        type: KEYWORDS.has(upper) ? "keyword" : "identifier",
        value: upper,
        line: startLine,
        column: startColumn,
      });
      continue;
    }

    if (/[0-9]/.test(char)) {
      const startLine = line;
      const startColumn = column;
      let value = "";
      while (index < sql.length && /[0-9.]/.test(sql[index])) {
        value += sql[index];
        advance(1);
      }
      tokens.push({ type: "number", value, line: startLine, column: startColumn });
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "comma", value: char, line, column });
      advance(1);
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char, line, column });
      advance(1);
      continue;
    }

    if (char === "*") {
      tokens.push({ type: "star", value: char, line, column });
      advance(1);
      continue;
    }

    if (char === ".") {
      tokens.push({ type: "dot", value: char, line, column });
      advance(1);
      continue;
    }

    if (char === ";") {
      tokens.push({ type: "semicolon", value: char, line, column });
      advance(1);
      continue;
    }

    if (/[=<>!]/.test(char)) {
      const startLine = line;
      const startColumn = column;
      let value = char;
      if (sql[index + 1] && /[=<>]/.test(sql[index + 1])) {
        value += sql[index + 1];
        advance(2);
      } else {
        advance(1);
      }
      tokens.push({ type: "operator", value, line: startLine, column: startColumn });
      continue;
    }

    return {
      tokens: [],
      error: {
        message: `Unexpected character "${char}".`,
        line,
        column,
      },
    };
  }

  return { tokens };
}

function buildError(message: string, token?: Token): ValidationResult {
  if (token) {
    return { valid: false, error: { message, line: token.line, column: token.column } };
  }
  return { valid: false, error: { message, line: 1, column: 1 } };
}

function findClauseIndex(tokens: Token[], keyword: string, startIndex: number): number {
  let depth = 0;
  for (let i = startIndex; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "paren") {
      if (token.value === "(") depth += 1;
      if (token.value === ")") depth = Math.max(0, depth - 1);
    }
    if (depth === 0 && token.type === "keyword" && token.value === keyword) {
      return i;
    }
  }
  return -1;
}

export function validateSqlQuery(sql: string): ValidationResult {
  const trimmed = sql.trim();
  if (!trimmed) {
    return buildError("SQL input is empty.");
  }

  const { tokens, error } = tokenizeSql(sql);
  if (error) {
    return { valid: false, error };
  }

  if (tokens.length === 0) {
    return buildError("SQL input is empty.");
  }

  const firstToken = tokens[0];
  if (firstToken.type !== "keyword" || firstToken.value !== "SELECT") {
    return buildError("Only SELECT queries are supported in this validator.", firstToken);
  }

  const fromIndex = findClauseIndex(tokens, "FROM", 0);
  if (fromIndex === -1) {
    return buildError("Expected FROM clause after SELECT.", tokens[tokens.length - 1]);
  }

  const tableToken = tokens[fromIndex + 1];
  if (!tableToken || tableToken.type !== "identifier") {
    return buildError("Expected a table name after FROM.", tableToken || tokens[fromIndex]);
  }

  let pendingJoinOn = false;
  let expectingJoinTable = false;
  let depth = 0;

  for (let i = fromIndex + 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "paren") {
      if (token.value === "(") depth += 1;
      if (token.value === ")") depth = Math.max(0, depth - 1);
    }
    if (depth > 0) continue;

    if (token.type === "keyword" && token.value === "JOIN") {
      pendingJoinOn = true;
      expectingJoinTable = true;
      continue;
    }

    if (expectingJoinTable) {
      if (token.type === "identifier") {
        expectingJoinTable = false;
        continue;
      }
      return buildError("Expected a table name after JOIN.", token);
    }

    if (token.type === "keyword" && token.value === "ON") {
      if (!pendingJoinOn) {
        return buildError("ON clause found without a JOIN.", token);
      }
      pendingJoinOn = false;
      continue;
    }

    if (token.type === "keyword" && CLAUSE_KEYWORDS.has(token.value)) {
      if (pendingJoinOn) {
        return buildError("JOIN clause missing an ON condition.", token);
      }
      if (token.value === "GROUP" || token.value === "ORDER") {
        const nextToken = tokens[i + 1];
        if (!nextToken || nextToken.type !== "keyword" || nextToken.value !== "BY") {
          return buildError(`Expected BY after ${token.value}.`, nextToken || token);
        }
      }
    }
  }

  if (pendingJoinOn) {
    return buildError("JOIN clause missing an ON condition.", tokens[tokens.length - 1]);
  }

  return { valid: true };
}

export function formatSqlErrorDetails(sql: string, error: ValidationError): string {
  const lines = sql.split(/\r?\n/);
  const lineIndex = Math.max(0, Math.min(lines.length - 1, error.line - 1));
  const startLine = Math.max(0, lineIndex - 2);
  const endLine = Math.min(lines.length - 1, lineIndex + 2);
  const numberWidth = String(endLine + 1).length;
  const snippet: string[] = [];

  for (let i = startLine; i <= endLine; i += 1) {
    const prefix = i === lineIndex ? ">" : " ";
    const lineNumber = String(i + 1).padStart(numberWidth, " ");
    snippet.push(`${prefix} ${lineNumber}: ${lines[i]}`);
    if (i === lineIndex) {
      const caretPadding = " ".repeat(numberWidth + 4 + Math.max(0, error.column - 1));
      snippet.push(`${caretPadding}^`);
    }
  }

  return [
    "Invalid SQL query:",
    `SyntaxError on line ${error.line}, column ${error.column}`,
    "",
    ...snippet,
  ].join("\n");
}

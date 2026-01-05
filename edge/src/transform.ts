import { parse, print, visit, Kind } from "graphql";

export function injectTypename(input: string) {
  let queryString;
  let isJson = false;
  let parsedJson;

  // Check if input is JSON format
  try {
    parsedJson = JSON.parse(input);
    if (parsedJson.query) {
      queryString = parsedJson.query;
      isJson = true;
    } else {
      queryString = input;
    }
  } catch {
    // Not JSON, treat as raw query string
    queryString = input;
  }

  // Parse and transform the query
  const ast = parse(queryString);

  const modifiedAst = visit(ast, {
    SelectionSet: {
      leave(node) {
        const hasTypename = node.selections.some(
          (selection) =>
            selection.kind === Kind.FIELD &&
            selection.name.value === "__typename",
        );

        if (!hasTypename) {
          return {
            ...node,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: "__typename",
                },
              },
              ...node.selections,
            ],
          };
        }

        return node;
      },
    },
  });

  const transformedQuery = print(modifiedAst);

  // If input was JSON, return JSON with transformed query
  if (isJson) {
    return JSON.stringify({
      ...parsedJson,
      query: transformedQuery,
    });
  }

  return transformedQuery;
}

export function getOperationType(
  query: string,
): "query" | "mutation" | "subscription" | null {
  // Handle JSON format
  let queryStr = query;
  try {
    const parsed = JSON.parse(query);
    if (parsed.query) {
      queryStr = parsed.query;
    }
  } catch {
    // Not JSON, use as is
  }

  const trimmed = queryStr.trim();

  if (trimmed.startsWith("mutation")) return "mutation";
  if (trimmed.startsWith("subscription")) return "subscription";
  if (trimmed.startsWith("query") || trimmed.startsWith("{")) return "query";

  return null;
}

// Extracts the operation name from a GraphQL query
export function getOperationName(query: string): string | null {
  // Handle JSON format
  let queryStr = query;
  try {
    const parsed = JSON.parse(query);
    if (parsed.operationName) {
      return parsed.operationName;
    }
    if (parsed.query) {
      queryStr = parsed.query;
    }
  } catch {
    // Not JSON, use as is
  }

  // Match: query Name or mutation Name
  const match = queryStr.match(/^(query|mutation|subscription)\s+(\w+)/);
  if (match) {
    return match[2];
  }

  return "NoOperationName";
}

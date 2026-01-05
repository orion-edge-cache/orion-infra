/**
 * Entity Extractor for GraphQL Responses
 *
 * Extracts entities from GraphQL responses using __typename + id pattern.
 * These become Surrogate Keys for cache invalidation.
 */

export interface Entity {
  type: string;
  id: string;
}

// Recursively extracts all entities from a GraphQL response
// Entities are objects with both __typename and id fields
export function extractEntities(data: unknown): Set<string> {
  const entities = new Set<string>();
  traverse(data, entities);
  return entities;
}

function traverse(node: unknown, entities: Set<string>): void {
  if (node === null || node === undefined) {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      traverse(item, entities);
    }
    return;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;

    // Check if this object is an entity (has __typename and id)
    if (typeof obj.__typename === "string" && obj.id !== undefined) {
      entities.add(`${obj.__typename}:${obj.id}`);
    }

    // Recurse into all fields
    for (const value of Object.values(obj)) {
      traverse(value, entities);
    }
  }
}

// Converts entity set to Surrogate-Key header value
export function toSurrogateKey(entities: Set<string>): string {
  return [...entities].join(" ");
}

// Extracts unique type names from entity keys (e.g., "User:123" -> "User")
export function extractEntityTypes(entities: Set<string>): Set<string> {
  const types = new Set<string>();
  for (const entity of entities) {
    const colonIndex = entity.indexOf(":");
    if (colonIndex > 0) {
      types.add(entity.substring(0, colonIndex));
    }
  }
  return types;
}

// Detects if a GraphQL query is a mutation
export function isMutation(query: string): boolean {
  const trimmed = query.trim();
  return (
    trimmed.startsWith("mutation") ||
    (trimmed.startsWith("{") === false && /^\s*mutation\s/i.test(trimmed))
  );
}

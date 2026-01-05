/**
 * Entity Extractor for GraphQL Responses
 *
 * Extracts entities from GraphQL responses using __typename + id pattern.
 * These become Surrogate Keys for cache invalidation.
 */
// Recursively extracts all entities from a GraphQL response
// Entities are objects with both __typename and id fields
export function extractEntities(data) {
    const entities = new Set();
    traverse(data, entities);
    return entities;
}
function traverse(node, entities) {
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
        const obj = node;
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
export function toSurrogateKey(entities) {
    return [...entities].join(" ");
}
// Extracts unique type names from entity keys (e.g., "User:123" -> "User")
export function extractEntityTypes(entities) {
    const types = new Set();
    for (const entity of entities) {
        const colonIndex = entity.indexOf(":");
        if (colonIndex > 0) {
            types.add(entity.substring(0, colonIndex));
        }
    }
    return types;
}
// Detects if a GraphQL query is a mutation
export function isMutation(query) {
    const trimmed = query.trim();
    return (trimmed.startsWith("mutation") ||
        (trimmed.startsWith("{") === false && /^\s*mutation\s/i.test(trimmed)));
}
//# sourceMappingURL=entities.js.map
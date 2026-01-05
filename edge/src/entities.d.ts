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
export declare function extractEntities(data: unknown): Set<string>;
export declare function toSurrogateKey(entities: Set<string>): string;
export declare function extractEntityTypes(entities: Set<string>): Set<string>;
export declare function isMutation(query: string): boolean;
//# sourceMappingURL=entities.d.ts.map
/**
 * Domain-level error classes. The HTTP error mapper translates each to its
 * envelope + status. Keeping these in one place keeps the contract test surface
 * small and makes the mapping in src/middleware/error-mapper.ts a flat switch.
 */

export class ValidationError extends Error {
  readonly fields?: Record<string, string>;
  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class DuckNotFoundError extends Error {
  constructor(slug: string) {
    super(`duck not found: ${slug}`);
    this.name = "DuckNotFoundError";
  }
}

export class DuplicateNameError extends Error {
  readonly fields: Record<string, string>;
  constructor(name: string) {
    super(`duck with this name already exists: ${name}`);
    this.name = "DuplicateNameError";
    this.fields = { name: "duck with this name already exists" };
  }
}

export class LineNotFoundError extends Error {
  constructor(duckId: string) {
    super(`cart line not found: ${duckId}`);
    this.name = "LineNotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "missing or invalid admin credentials") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class CatalogEmptyError extends Error {
  constructor(message = "no duck available for this recommendation") {
    super(message);
    this.name = "CatalogEmptyError";
  }
}

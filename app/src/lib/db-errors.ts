/**
 * Postgres error classification helpers for server actions that perform
 * hard deletes. postgres-js throws a `PostgresError` (see node_modules/postgres)
 * whose `code` field carries the raw SQLSTATE — 23503 is foreign_key_violation.
 */
export function isForeignKeyViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23503"
  );
}

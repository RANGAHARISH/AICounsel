import { Pool } from "pg";

// Use a singleton cache to prevent creating multiple pools in dev mode
const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = pool;
}

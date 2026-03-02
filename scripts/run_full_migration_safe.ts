import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const migrationPath = path.join(process.cwd(), "better-auth_migrations", "2026-02-28T13-33-10.098Z.sql");
    console.log(`Reading migration from: ${migrationPath}`);

    try {
        const sql = fs.readFileSync(migrationPath, "utf-8");
        // Split by semicolon, but be careful with statements that might contain semicolons (usually not in migrations)
        const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);

        console.log(`Executing ${statements.length} statements...`);
        for (const stmt of statements) {
            console.log(`Executing: ${stmt.substring(0, 50)}...`);
            await pool.query(stmt);
        }
        console.log("Full Migration successful!");
    } catch (err: any) {
        console.error("Migration failed:", err.message || err);
        if (err.detail) console.error("Detail:", err.detail);
        if (err.where) console.error("Where:", err.where);
    } finally {
        await pool.end();
    }
}

runMigration();

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
        console.log("Executing SQL...");
        // Split by semicolon if there are multiple statements, though pg driver can handle it sometimes
        // But Better-Auth migrations are usually simple.
        await pool.query(sql);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();

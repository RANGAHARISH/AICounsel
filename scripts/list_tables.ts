import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function listTables() {
    console.log("Listing all tables in 'public' schema...");
    try {
        const res = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Tables found:", res.rows.map(r => r.tablename));
    } catch (err) {
        console.error("Listing failed:", err);
    } finally {
        await pool.end();
    }
}

listTables();

import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function diagnose() {
    console.log("Checking database connection...");
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("Connection successful:", res.rows[0]);

        console.log("Checking for 'user' table...");
        const userTable = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'user'");
        console.log("'user' table check:", userTable.rows);

        console.log("Checking for 'password_resets' table...");
        const pwTable = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'password_resets'");
        console.log("'password_resets' table check:", pwTable.rows);

    } catch (err) {
        console.error("Diagnosis failed:", err);
    } finally {
        await pool.end();
    }
}

diagnose();

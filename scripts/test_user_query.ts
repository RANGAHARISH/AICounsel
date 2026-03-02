import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testQuery() {
    try {
        console.log("Retrieving emails from 'user' table...");
        const users = await pool.query('SELECT email FROM "user"');
        console.log("Users found:", users.rows);

        console.log("Checking columns of 'password_resets'...");
        const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'password_resets'");
        console.log("Columns:", columns.rows.map(c => c.column_name));

    } catch (err: any) {
        console.error("Query failed:", err.message);
    } finally {
        await pool.end();
    }
}

testQuery();

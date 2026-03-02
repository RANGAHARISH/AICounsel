import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testQuery() {
    try {
        const users = await pool.query('SELECT email FROM "user"');
        console.log("USERS_START");
        console.log(JSON.stringify(users.rows));
        console.log("USERS_END");

        const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'password_resets'");
        console.log("COLUMNS_START");
        console.log(JSON.stringify(columns.rows.map(c => c.column_name)));
        console.log("COLUMNS_END");

    } catch (err: any) {
        console.error("Query failed:", err.message);
    } finally {
        await pool.end();
    }
}

testQuery();

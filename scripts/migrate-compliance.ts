import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const client = await pool.connect();
    try {
        console.log("Creating tables...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        state TEXT NOT NULL,
        industry TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS compliance_requirements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        default_frequency TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS business_deadlines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reminder_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Seed some default compliance requirements
      INSERT INTO compliance_requirements (title, description, category, default_frequency)
      VALUES 
        ('Annual Report', 'File annual LLC/Corporation report with the state.', 'annual_report', 'annual'),
        ('Business License Renewal', 'Renew standard local business license.', 'license', 'annual'),
        ('Sales Tax Filing', 'File and remit sales tax collected.', 'tax', 'quarterly'),
        ('Franchise Tax', 'State franchise tax payment.', 'tax', 'annual')
      ON CONFLICT DO NOTHING;
    `);
        console.log("Tables created successfully.");
    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();

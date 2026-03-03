const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });
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
        country TEXT DEFAULT 'US',
        state TEXT NOT NULL,
        industry TEXT,
        employees_count INTEGER DEFAULT 0,
        has_contractors BOOLEAN DEFAULT false,
        collects_personal_data BOOLEAN DEFAULT false,
        has_physical_premises BOOLEAN DEFAULT false,
        registration_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Add missing columns if they don't exist (for existing tables)
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='country') THEN
          ALTER TABLE businesses ADD COLUMN country TEXT DEFAULT 'US';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='employees_count') THEN
          ALTER TABLE businesses ADD COLUMN employees_count INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='has_contractors') THEN
          ALTER TABLE businesses ADD COLUMN has_contractors BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='collects_personal_data') THEN
          ALTER TABLE businesses ADD COLUMN collects_personal_data BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='has_physical_premises') THEN
          ALTER TABLE businesses ADD COLUMN has_physical_premises BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='registration_date') THEN
          ALTER TABLE businesses ADD COLUMN registration_date DATE;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS compliance_requirements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL UNIQUE,
        description TEXT,
        category TEXT NOT NULL,
        default_frequency TEXT NOT NULL,
        jurisdiction_country TEXT DEFAULT 'US',
        jurisdiction_state TEXT, -- NULL means Federal/All
        filing_url TEXT,
        required_documents TEXT[],
        estimated_processing_time TEXT,
        filing_fee TEXT,
        penalty_description TEXT,
        priority_level TEXT DEFAULT 'Medium'
      );

      -- Add missing columns to compliance_requirements
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='jurisdiction_country') THEN
          ALTER TABLE compliance_requirements ADD COLUMN jurisdiction_country TEXT DEFAULT 'US';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME='compliance_requirements' AND CONSTRAINT_TYPE='UNIQUE' AND CONSTRAINT_NAME='compliance_requirements_title_key') THEN
          ALTER TABLE compliance_requirements ADD CONSTRAINT compliance_requirements_title_key UNIQUE (title);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='jurisdiction_state') THEN
          ALTER TABLE compliance_requirements ADD COLUMN jurisdiction_state TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='filing_url') THEN
          ALTER TABLE compliance_requirements ADD COLUMN filing_url TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='required_documents') THEN
          ALTER TABLE compliance_requirements ADD COLUMN required_documents TEXT[];
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='estimated_processing_time') THEN
          ALTER TABLE compliance_requirements ADD COLUMN estimated_processing_time TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='filing_fee') THEN
          ALTER TABLE compliance_requirements ADD COLUMN filing_fee TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='penalty_description') THEN
          ALTER TABLE compliance_requirements ADD COLUMN penalty_description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='compliance_requirements' AND COLUMN_NAME='priority_level') THEN
          ALTER TABLE compliance_requirements ADD COLUMN priority_level TEXT DEFAULT 'Medium';
        END IF;
      END $$;
      
      -- Seed advanced compliance requirements
      INSERT INTO compliance_requirements 
      (title, description, category, default_frequency, jurisdiction_country, jurisdiction_state, filing_url, required_documents, estimated_processing_time, filing_fee, penalty_description, priority_level)
      VALUES 
        (
          'FinCEN Beneficial Ownership Information (BOI) Report', 
          'Mandatory federal filing disclosing individuals who own or control the company.', 
          'federal_filing', 
          'one-time', 
          'US', 
          NULL, 
          'https://boiefiling.fincen.gov/', 
          ARRAY['Business ID Number (EIN/SSN)', 'Owner ID Documents', 'Company Information'],
          '30-60 minutes',
          'Free',
          'Civil penalties up to $500/day; criminal penalties up to $10,000 and 2 years prison.',
          'High'
        ),
        (
          'California Statement of Information (Form LLC-12)', 
          'Updates state records with current address and management info.', 
          'state_filing', 
          'biennial', 
          'US', 
          'CA', 
          'https://bizfileonline.sos.ca.gov/', 
          ARRAY['Entity Name', 'Secretary of State ID', 'Management List'],
          'Online immediate',
          '$20',
          '$250 late fee and potential suspension of entity status.',
          'High'
        ),
        (
          'California Franchise Tax (Minimum Tax)', 
          'Annual $800 minimum tax for the privilege of doing business in CA.', 
          'tax', 
          'annual', 
          'US', 
          'CA', 
          'https://www.ftb.ca.gov/pay/', 
          ARRAY['EIN', 'Entity ID', 'Payment Method'],
          'Online immediate',
          '$800',
          'Interest plus penalties for late payment; potential loss of good standing.',
          'High'
        ),
        (
          'IRS Form 1120 (C-Corp Tax Return)', 
          'Annual income tax return for C-Corporations.', 
          'tax', 
          'annual', 
          'US', 
          NULL, 
          'https://www.irs.gov/forms-pubs/about-form-1120', 
          ARRAY['Financial Statements', 'EIN', 'Expense Records'],
          'Varies',
          'Free (Filing)',
          '5% of unpaid tax per month, max 25%.',
          'High'
        )
      ON CONFLICT (title) DO UPDATE SET
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        jurisdiction_state = EXCLUDED.jurisdiction_state,
        filing_url = EXCLUDED.filing_url,
        penalty_description = EXCLUDED.penalty_description,
        priority_level = EXCLUDED.priority_level;
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

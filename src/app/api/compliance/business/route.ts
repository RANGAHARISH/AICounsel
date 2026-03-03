import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { rows } = await pool.query(
            "SELECT * FROM businesses WHERE user_id = $1 LIMIT 1",
            [userId]
        );

        return NextResponse.json({ business: rows[0] || null });
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json({ error: "Failed to fetch business" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            entity_type,
            state,
            industry,
            country = 'US',
            employees_count = 0,
            has_contractors = false,
            collects_personal_data = false,
            has_physical_premises = false,
            registration_date = null
        } = body;

        // Check if user already has a business
        const existing = await pool.query(
            "SELECT id FROM businesses WHERE user_id = $1 LIMIT 1",
            [userId]
        );

        let business;
        if (existing.rows.length > 0) {
            // Update
            const res = await pool.query(
                `UPDATE businesses 
                 SET name = $1, entity_type = $2, state = $3, industry = $4,
                     country = $5, employees_count = $6, has_contractors = $7,
                     collects_personal_data = $8, has_physical_premises = $9,
                     registration_date = $10
                 WHERE user_id = $11 
                 RETURNING *`,
                [
                    name, entity_type, state, industry,
                    country, employees_count, has_contractors,
                    collects_personal_data, has_physical_premises,
                    registration_date, userId
                ]
            );
            business = res.rows[0];
        } else {
            // Insert
            const res = await pool.query(
                `INSERT INTO businesses (
                    user_id, name, entity_type, state, industry,
                    country, employees_count, has_contractors,
                    collects_personal_data, has_physical_premises,
                    registration_date
                ) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                 RETURNING *`,
                [
                    userId, name, entity_type, state, industry,
                    country, employees_count, has_contractors,
                    collects_personal_data, has_physical_premises,
                    registration_date
                ]
            );
            business = res.rows[0];
        }

        return NextResponse.json({ business });
    } catch (error) {
        console.error("Error saving business:", error);
        return NextResponse.json({ error: "Failed to save business" }, { status: 500 });
    }
}

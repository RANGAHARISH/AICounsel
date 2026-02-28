import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const sessionRes = await auth.api.getSession({ headers: req.headers });
        const session = (sessionRes as any)?.data;
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
        const sessionRes = await auth.api.getSession({ headers: req.headers });
        const session = (sessionRes as any)?.data;
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, entity_type, state, industry } = body;

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
         SET name = $1, entity_type = $2, state = $3, industry = $4 
         WHERE user_id = $5 
         RETURNING *`,
                [name, entity_type, state, industry, userId]
            );
            business = res.rows[0];
        } else {
            // Insert
            const res = await pool.query(
                `INSERT INTO businesses (user_id, name, entity_type, state, industry) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [userId, name, entity_type, state, industry]
            );
            business = res.rows[0];
        }

        return NextResponse.json({ business });
    } catch (error) {
        console.error("Error saving business:", error);
        return NextResponse.json({ error: "Failed to save business" }, { status: 500 });
    }
}

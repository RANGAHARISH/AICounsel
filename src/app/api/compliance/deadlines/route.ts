import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/compliance/deadlines
export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get("businessId");

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        // Verify ownership
        const ownerCheck = await pool.query(
            "SELECT id FROM businesses WHERE id = $1 AND user_id = $2",
            [businessId, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { rows } = await pool.query(
            `SELECT d.*, r.category, r.default_frequency
       FROM business_deadlines d
       LEFT JOIN compliance_requirements r ON d.requirement_id = r.id
       WHERE d.business_id = $1
       ORDER BY d.due_date ASC`,
            [businessId]
        );

        return NextResponse.json({ deadlines: rows });
    } catch (error) {
        console.error("Error fetching deadlines:", error);
        return NextResponse.json({ error: "Failed to fetch deadlines" }, { status: 500 });
    }
}

// POST /api/compliance/deadlines/generate (Auto-generate MVP deadlines)
export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { businessId } = body;

        if (!businessId) return NextResponse.json({ error: "Missing businessId" }, { status: 400 });

        const ownerCheck = await pool.query(
            "SELECT * FROM businesses WHERE id = $1 AND user_id = $2",
            [businessId, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const business = ownerCheck.rows[0];

        // Fetch requirements matching this business's profile
        // - Specific state or NULL (Federal)
        // - Matching country
        // - TODO: Industry specific filtering
        const reqs = await pool.query(
            `SELECT * FROM compliance_requirements 
             WHERE jurisdiction_country = $1 
             AND (jurisdiction_state = $2 OR jurisdiction_state IS NULL)`,
            [business.country, business.state]
        );

        let createdCount = 0;
        for (const req of reqs.rows) {
            // Check if deadline already exists for one-time filings
            if (req.default_frequency === 'one-time') {
                const existing = await pool.query(
                    "SELECT id FROM business_deadlines WHERE business_id = $1 AND requirement_id = $2",
                    [businessId, req.id]
                );
                if (existing.rows.length > 0) continue;
            }

            // Calculate due date based on frequency
            const today = new Date();
            let dueDate = new Date();

            if (req.default_frequency === 'annual') {
                // Default to end of next fiscal quarter or specific date logic
                dueDate.setFullYear(today.getFullYear(), 11, 31); // Dec 31 for now
                if (dueDate < today) dueDate.setFullYear(today.getFullYear() + 1);
            } else if (req.default_frequency === 'biennial') {
                dueDate.setFullYear(today.getFullYear() + 1, 11, 31);
            } else if (req.default_frequency === 'one-time') {
                // Typically 90 days from registration for things like BOI
                const regDate = business.registration_date ? new Date(business.registration_date) : today;
                dueDate = new Date(regDate);
                dueDate.setDate(dueDate.getDate() + 90);
                if (dueDate < today) {
                    // If overdue based on registration, set to 30 days from now as a "grace" period warning
                    dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 30);
                }
            } else {
                dueDate.setMonth(today.getMonth() + 3);
            }

            await pool.query(
                `INSERT INTO business_deadlines 
                 (business_id, requirement_id, title, description, due_date)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT DO NOTHING`,
                [businessId, req.id, req.title, req.description, dueDate]
            );
            createdCount++;
        }

        return NextResponse.json({ success: true, count: createdCount });
    } catch (error) {
        console.error("Error generating deadlines:", error);
        return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
    }
}

// PATCH /api/compliance/deadlines (Mark as complete/pending)
export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { deadlineId, status } = body;

        // Ensure owner owns the business that owns this deadline
        const ownerCheck = await pool.query(
            `SELECT d.id FROM business_deadlines d
             JOIN businesses b ON b.id = d.business_id
             WHERE d.id = $1 AND b.user_id = $2`,
            [deadlineId, userId]
        );

        if (ownerCheck.rows.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        await pool.query(
            "UPDATE business_deadlines SET status = $1 WHERE id = $2",
            [status, deadlineId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating deadline:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

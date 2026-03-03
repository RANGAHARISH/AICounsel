import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        const userId = session?.user?.id;

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get the business
        const businessResult = await pool.query(
            "SELECT * FROM businesses WHERE user_id = $1 LIMIT 1",
            [userId]
        );
        const business = businessResult.rows[0];

        if (!business) return NextResponse.json({ error: "No business profile found" }, { status: 404 });

        // Get deadlines with priority info
        const { rows: deadlines } = await pool.query(
            `SELECT d.*, r.priority_level, r.penalty_description
             FROM business_deadlines d
             LEFT JOIN compliance_requirements r ON d.requirement_id = r.id
             WHERE d.business_id = $1`,
            [business.id]
        );

        // Core Calculation Logic
        let score = 100;
        type HighRiskIssue = {
            title: string;
            severity: string;
            reason: string;
            penalty?: string;
        };
        const highRiskIssues: HighRiskIssue[] = [];
        const recommendations = [];

        const today = new Date();

        deadlines.forEach((d) => {
            const isFiled = d.status === "filed";
            const dueDate = new Date(d.due_date);
            const isOverdue = !isFiled && dueDate < today;
            const priority = d.priority_level || "Medium";

            if (isOverdue) {
                if (priority === "High") {
                    score -= 30;
                    highRiskIssues.push({
                        title: d.title,
                        severity: "High",
                        reason: "Overdue high-priority filing.",
                        penalty: d.penalty_description
                    });
                } else {
                    score -= 15;
                    highRiskIssues.push({
                        title: d.title,
                        severity: "Medium",
                        reason: "Overdue filing.",
                        penalty: d.penalty_description
                    } as HighRiskIssue);
                }
            } else if (!isFiled && priority === "High") {
                // Not overdue yet but high priority pending
                score -= 5;
            }
        });

        // Ensure score doesn't go below 0
        score = Math.max(0, score);

        // Smart Recommendations
        if (score < 100) {
            recommendations.push("Prioritize high-risk overdue filings to avoid compounding penalties.");
        }
        if (deadlines.length < 3) {
            recommendations.push("Your compliance profile seems light. Ensure your industry and state information are correct.");
        }
        if (!business.registration_date) {
            recommendations.push("Add your registration date to refine deadline calculations (e.g., for BOI reporting).");
        }

        return NextResponse.json({
            score,
            executiveSummary: `Your business has a compliance health score of ${score}/100. ${score === 100 ? "You are fully up to date." : "Action is required to address outstanding obligations."
                }`,
            highRiskIssues,
            recommendations,
            businessInfo: {
                name: business.name,
                type: business.entity_type,
                jurisdiction: `${business.state}, ${business.country}`
            }
        });
    } catch (error) {
        console.error("Error generating summary:", error);
        return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }
}

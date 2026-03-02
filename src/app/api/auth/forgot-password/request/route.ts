import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Verify user exists in better-auth "user" table
        const userCheck = await pool.query('SELECT id FROM "user" WHERE email = $1', [email]);
        if (userCheck.rows.length === 0) {
            // Security: Do not reveal if email exists, just say "If an account exists..."
            return NextResponse.json({ message: "If an account exists, an OTP has been sent." });
        }

        // 2. Rate Limiting Check (3 requests per hour)
        const rateLimitCheck = await pool.query(
            "SELECT last_request_at FROM password_resets WHERE email = $1",
            [email]
        );

        if (rateLimitCheck.rows.length > 0) {
            const lastRequest = new Date(rateLimitCheck.rows[0].last_request_at);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            // Check if they already made 3 requests in the last hour
            // (Simplified: check if last request was too recent for spam prevention)
            if (lastRequest > new Date(Date.now() - 2 * 60 * 1000)) { // 2 minute cooldown between requests
                return NextResponse.json({ error: "Please wait a moment before requesting another OTP." }, { status: 429 });
            }
        }

        // 3. Generate and Hash OTP
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp, email);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 4. Store/Update in Database
        await pool.query(
            `INSERT INTO password_resets (email, otp_hash, expires_at, attempts, last_request_at)
       VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET
       otp_hash = $2, expires_at = $3, attempts = 0, last_request_at = CURRENT_TIMESTAMP, locked_until = NULL`,
            [email, hashedOTP, expiresAt]
        );

        // 5. Send Email
        await sendOTPEmail(email, otp);

        return NextResponse.json({ message: "If an account exists with that email, an OTP has been sent." });
    } catch (error) {
        console.error("OTP Request Error:", error);
        return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
    }
}

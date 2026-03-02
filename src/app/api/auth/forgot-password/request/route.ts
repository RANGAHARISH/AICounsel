import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        console.log("[AUTH_TRACE] Starting OTP request...");
        const { email } = await req.json();
        console.log(`[AUTH_TRACE] Email: ${email}`);
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Verify user exists in better-auth "user" table
        console.log("[AUTH_TRACE] Checking user table...");
        const userCheck = await pool.query('SELECT id FROM "user" WHERE email = $1', [email]);
        if (userCheck.rows.length === 0) {
            console.log(`[AUTH_TRACE] User not found: ${email}`);
            // Security: Do not reveal if email exists, just say "If an account exists..."
            return NextResponse.json({ message: "If an account exists, an OTP has been sent." });
        }

        // 2. Rate Limiting Check
        console.log("[AUTH_TRACE] Checking rate limit...");
        const rateLimitCheck = await pool.query(
            "SELECT last_request_at FROM password_resets WHERE email = $1",
            [email]
        );

        if (rateLimitCheck.rows.length > 0) {
            const lastRequest = new Date(rateLimitCheck.rows[0].last_request_at);
            if (lastRequest > new Date(Date.now() - 60 * 1000)) { // 1 min cooldown
                console.log(`[AUTH_TRACE] Rate limited: ${email}`);
                return NextResponse.json({ error: "Please wait a moment before requesting another OTP." }, { status: 429 });
            }
        }

        // 3. Generate and Hash OTP
        console.log("[AUTH_TRACE] Generating OTP...");
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp, email);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 4. Store/Update in Database
        console.log("[AUTH_TRACE] Storing OTP...");
        await pool.query(
            `INSERT INTO password_resets (email, otp_hash, expires_at, attempts, last_request_at)
       VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET
       otp_hash = $2, expires_at = $3, attempts = 0, last_request_at = CURRENT_TIMESTAMP, locked_until = NULL`,
            [email, hashedOTP, expiresAt]
        );

        // 5. Send Email
        console.log("[AUTH_TRACE] Sending email...");
        const emailResult = await sendOTPEmail(email, otp);
        console.log(`[AUTH_TRACE] Email result: ${JSON.stringify(emailResult)}`);

        return NextResponse.json({ message: "If an account exists with that email, an OTP has been sent." });
    } catch (error: any) {
        console.error("[AUTH_TRACE] OTP Request Error:", error.message || error);
        if (error.stack) console.error(error.stack);
        return NextResponse.json({
            error: "Failed to process request.",
            debug: error.message || "Unknown error"
        }, { status: 500 });
    }
}

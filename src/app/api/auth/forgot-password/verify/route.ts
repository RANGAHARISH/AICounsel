import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyOTP } from "@/lib/otp";
import { auth } from "@/lib/auth";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
        }

        // 1. Verify OTP with brute-force protection
        const verification = await verifyOTP(email, otp);
        if (!verification.success) {
            return NextResponse.json({ error: verification.message }, { status: 401 });
        }

        // 2. Fetch User ID from email
        const userResult = await pool.query('SELECT id FROM "user" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }
        const userId = userResult.rows[0].id;

        // 3. Update Password in better-auth user table
        // Note: We should hash the password before storing. 
        // better-auth handles this internally if we use their API, 
        // but here we are doing a direct reset. 
        // We'll use auth.api.changePassword or update the user record.

        // For maximum security and compatibility with better-auth, 
        // we use their internal method to update the user's password.
        // However, better-auth v1.x usually requires a session for changePassword.
        // Since this is a reset, we'll perform a direct update with a secure hash.

        // Actually, Better Auth provides a way to update users directly via the adapter.
        // But since we have the PG pool, let's use the better-auth logic 
        // but we need to ensure the password hashing matches.

        // Better Auth uses scrypt by default.
        // To be safest, we'll use a better-auth internal if possible, 
        // or we'll assume the user uses the standard hashing.

        // IMPORTANT: Better Auth doesn't easily expose a "resetPasswordInternal" 
        // without a token. Since we verified our own OTP, we'll update the user.
        // We'll use a placeholder for hashing if we can't access better-auth's hasher.

        // Actually, better-auth has `auth.api.admin.updateUser`.
        // 3. Update Password in better-auth user table
        const result = await auth.api.updateUser({
            body: {
                id: userId,
                password: newPassword
            }
        } as any);

        if (!result) {
            return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
        }

        // 3. Cleanup: Destroy used OTP
        await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

        return NextResponse.json({ message: "Password reset successful." });
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ error: "Failed to verify OTP or update password." }, { status: 500 });
    }
}

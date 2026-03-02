import crypto from "crypto";
import { pool } from "@/lib/db";

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hashes an OTP using pbkdf2 with a per-user salt (their email).
 * Using a slow hash is crucial although 6-digit space is small.
 */
export async function hashOTP(otp: string, email: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = Buffer.from(email + (process.env.BETTER_AUTH_SECRET || "default_salt"), "utf-8");
        crypto.pbkdf2(otp, salt, 100000, 64, "sha512", (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString("hex"));
        });
    });
}

/**
 * Checks if a user is currently locked out from reset attempts.
 */
export async function checkLockout(email: string): Promise<{ locked: boolean; lockedUntil?: Date }> {
    const result = await pool.query(
        "SELECT locked_until FROM password_resets WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) return { locked: false };

    const lockedUntil = result.rows[0].locked_until;
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
        return { locked: true, lockedUntil: new Date(lockedUntil) };
    }

    return { locked: false };
}

/**
 * Verifies an OTP against the stored hash.
 * Implements brute-force protection (5 attempts).
 */
export async function verifyOTP(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const result = await pool.query(
        "SELECT otp_hash, expires_at, attempts, locked_until FROM password_resets WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {
        return { success: false, message: "No active reset request found." };
    }

    const { otp_hash, expires_at, attempts, locked_until } = result.rows[0];

    // Check lockout
    if (locked_until && new Date(locked_until) > new Date()) {
        return { success: false, message: "Account is temporarily locked. Please try again later." };
    }

    // Check expiration
    if (new Date(expires_at) < new Date()) {
        await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);
        return { success: false, message: "OTP has expired. Please request a new one." };
    }

    // Verify hash
    const currentHash = await hashOTP(otp, email);
    if (currentHash === otp_hash) {
        // Single-use: deletion will happen after password reset
        return { success: true };
    }

    // Handle failed attempt
    const newAttempts = attempts + 1;
    if (newAttempts >= 5) {
        const lockoutTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        await pool.query(
            "UPDATE password_resets SET attempts = $1, locked_until = $2 WHERE email = $3",
            [newAttempts, lockoutTime, email]
        );
        return { success: false, message: "Too many failed attempts. Account locked for 15 minutes." };
    } else {
        await pool.query(
            "UPDATE password_resets SET attempts = $1 WHERE email = $2",
            [newAttempts, email]
        );
        return { success: false, message: `Incorrect OTP. ${5 - newAttempts} attempts remaining.` };
    }
}

/**
 * Simple email delivery service integration.
 * Fallback to console logging if RESEND_API_KEY is missing.
 */
export async function sendOTPEmail(email: string, otp: string) {
    const apiKey = process.env.RESEND_API_KEY;

    const subject = "Your Secure Password Reset OTP";
    const text = `
    Your 6-digit password reset OTP is: ${otp}
    
    This OTP will expire in exactly 60 seconds.
    
    If you did not request a password reset, please ignore this email and ensure your account is secure.
    
    Security Alert: Never share this OTP with anyone. AICounsel staff will never ask for your OTP.
  `;

    if (!apiKey) {
        console.log("\n--- [DEV MODE] SECURE OTP EMAIL ---");
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text}`);
        console.log("-----------------------------------\n");
        return { success: true, message: "Email sent (Logged to console)" };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: "AICounsel <noreply@aicounsel.ai>", // Update this with your verified domain
                to: [email],
                subject: subject,
                text: text,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Resend API Error:", errorData);
            return { success: false, error: errorData };
        }

        return { success: true };
    } catch (error) {
        console.error("Email send exception:", error);
        return { success: false, error };
    }
}

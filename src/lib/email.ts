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
        console.log("\n--- [DEV MODE] SECURE OTP EMAIL (API KEY MISSING) ---");
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`OTP Code: ${otp}`);
        console.log("Check this console for the code since RESEND_API_KEY is not set.");
        console.log("-----------------------------------\n");
        return { success: true, message: "Email logged to terminal (No API Key)" };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                // Use resend.dev for testing if no verified domain is available
                from: "AICounsel <onboarding@resend.dev>",
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

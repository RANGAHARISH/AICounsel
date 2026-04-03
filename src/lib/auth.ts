import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from "./email";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      console.log(`\n--- PASSWORD RESET OTP LINK ---\nUser: ${user.email}\nLink: ${url}\n-------------------------------\n`);
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, ""),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://[::1]:3000",
    "http://[::1]:3001",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ].map(o => o?.replace(/\/$/, "")).filter(Boolean),
  advanced: {
    trustProxy: true,
    disableCsrfCheck: true,
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }: { email: string; otp: string; type: string }) {
        console.log(`[AUTH_TRACE] Sending ${type} OTP to ${email}`);
        await sendOTPEmail(email, otp);
      },
      expiresIn: 60,
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: true, // Server controls via before hook; client input is overwritten
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Diagnostic logging for Origin issues
      const origin = ctx?.headers?.get("origin");
      const host = ctx?.headers?.get("host");
      const referer = ctx?.headers?.get("referer");
      if (origin || host) {
        console.log(`[AUTH_DIAGNOSTIC] Origin: ${origin} Host: ${host} Referer: ${referer} Path: ${ctx.path}`);
      }
      if (ctx.path === "/sign-up/email" && ctx.body?.email) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const role =
          adminEmail && ctx.body.email.toLowerCase() === adminEmail.toLowerCase()
            ? "admin"
            : "user";
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              role,
            },
          },
        };
      }
    }),
  },
});

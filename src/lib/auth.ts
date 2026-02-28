import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3000"
  ],
  plugins: [nextCookies()],
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

import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";

import { db } from "@/lib/db";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required.");
}

export const auth = betterAuth({
  database: {
    db,
    type: "mysql",
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [username()],
});

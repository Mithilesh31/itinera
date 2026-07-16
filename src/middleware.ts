import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: uses the base config (no Prisma) to guard routes.
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except static assets and the auth API.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

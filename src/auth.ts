import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

// Build the provider list. Google is only enabled when credentials are present,
// so the app runs fine before you set up Google OAuth.
const providers: NextAuthConfig["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

// One-click demo account — great for reviewers who don't want to sign up.
// Signs the visitor in as a shared demo user (no password).
providers.push(
  Credentials({
    id: "demo",
    name: "Demo account",
    credentials: {},
    async authorize() {
      const email = "demo@itinera.app";
      const user = await db.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: "Demo Traveler",
          image: "https://avatars.githubusercontent.com/u/0",
        },
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  // Required for deployment behind a proxy (Vercel) so Auth.js trusts the host.
  trustHost: true,
});

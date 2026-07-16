import type { NextAuthConfig } from "next-auth";

// Edge-safe base config used by middleware. No database/Prisma imports here,
// so it can run in the Edge runtime. Providers with DB access live in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], // real providers are added in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Viewing trips + Explore is public; creating and the dashboard require auth.
      const protectedPrefixes = ["/dashboard", "/trips/new"];
      const isProtected = protectedPrefixes.some((p) =>
        nextUrl.pathname.startsWith(p),
      );
      if (isProtected && !isLoggedIn) return false; // redirect to /login
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

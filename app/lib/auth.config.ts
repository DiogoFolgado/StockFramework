import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user;
      const path        = nextUrl.pathname;
      const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");
      const isApiRoute  = path.startsWith("/api");

      if (isApiRoute)                     return true;
      if (isAuthRoute && isLoggedIn)      return Response.redirect(new URL("/", nextUrl));
      if (!isAuthRoute && !isLoggedIn)    return Response.redirect(new URL("/login", nextUrl));
      return true;
    },
  },
  providers: [],
};

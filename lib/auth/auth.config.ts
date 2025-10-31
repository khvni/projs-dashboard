// NextAuth v5 configuration
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnProjects = nextUrl.pathname.startsWith('/projects');
      const isOnTeam = nextUrl.pathname.startsWith('/team');
      const isOnSettings = nextUrl.pathname.startsWith('/settings');
      const isPublicView = nextUrl.pathname.startsWith('/public-view');

      // Public views are accessible to everyone
      if (isPublicView) {
        return true;
      }

      // Protected routes require authentication
      if (isOnDashboard || isOnProjects || isOnTeam || isOnSettings) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Add user info to token on sign in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;

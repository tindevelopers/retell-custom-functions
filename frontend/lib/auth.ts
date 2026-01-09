import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByEmail } from './firestore';
import { Role } from './types';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      const existing = await getUserByEmail(user.email);
      return !!existing;
    },
    async jwt({ token }) {
      const user = await getUserByEmail(token.email);
      if (user) {
        token.role = user.role;
        token.assignedClients = user.assignedClients || [];
        token.name = user.name || token.name;
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as Session & {
        user: Session['user'] & { role?: Role; assignedClients?: string[] };
      };
      s.user = s.user || {};
      if (token.role) s.user.role = token.role as Role;
      if (token.assignedClients) s.user.assignedClients = token.assignedClients as string[];
      return s;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Exported for route handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession} from 'next-auth';
import { authOptions } from '@/lib/auth';

// Extend the default Session type to include isAdmin
declare module 'next-auth' {
  interface Session {
    user: {
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }
}

// Extend the JWT type to include isAdmin
declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
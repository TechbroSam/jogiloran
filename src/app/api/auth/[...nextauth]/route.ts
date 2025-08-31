// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, DefaultSession, DefaultUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Extend the default User type to include isAdmin
interface CustomUser extends DefaultUser {
  isAdmin?: boolean;
}

// Extend the default Session type to include isAdmin
declare module 'next-auth' {
  interface Session {
    user: {
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            isAdmin: user.email === process.env.ADMIN_EMAIL,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/', // Redirect to home page for login prompt
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }: { token: any; user?: CustomUser }) {
      if (user) {
        token.isAdmin = user.isAdmin; // No need for 'any' since user is typed as CustomUser
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin; // No need for 'any' since session.user is extended
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
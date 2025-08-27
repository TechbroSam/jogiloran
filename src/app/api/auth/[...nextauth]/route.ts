// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        // This is the single, correct block to check the password and return the user object
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            isAdmin: user.email === process.env.ADMIN_EMAIL,
          };
        }
        
        // Return null if user not found or password doesn't match
        return null;
      }
    })
  ],
  pages: {
    signIn: '/', // Redirect to home page for login prompt
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.isAdmin = (user as any).isAdmin;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user) {
            (session.user as any).isAdmin = token.isAdmin;
        }
        return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
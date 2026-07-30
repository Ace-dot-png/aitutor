import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUser } from "@/lib/store";

const baseUrl = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return findUser(credentials.email, credentials.password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id=(user as any).id; token.role=(user as any).role; token.schoolId=(user as any).schoolId; token.schoolName=(user as any).schoolName; token.grade=(user as any).grade; token.pin=(user as any).pin; token.linkedStudentId=(user as any).linkedStudentId; token.language=(user as any).language??"en"; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id=token.id; (session.user as any).role=token.role; (session.user as any).schoolId=token.schoolId; (session.user as any).schoolName=token.schoolName; (session.user as any).grade=token.grade; (session.user as any).pin=token.pin; (session.user as any).linkedStudentId=token.linkedStudentId; (session.user as any).language=token.language; }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

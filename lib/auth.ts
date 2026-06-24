import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Hardcoded demo users for instant login (DB-backed fallback when Neon connects)
const DEMO_USERS: Record<string, any> = {
  "admin@sandtonacademy.co.za": {
    id: "admin-1", email: "admin@sandtonacademy.co.za", name: "Mr. David Sithole",
    role: "ADMIN", schoolId: "school-1", schoolName: "Sandton Academy", grade: null, pin: null, linkedStudentId: null,
  },
  "n.dlamini@sandtonacademy.co.za": {
    id: "teacher-1", email: "n.dlamini@sandtonacademy.co.za", name: "Ms. Nomsa Dlamini",
    role: "TEACHER", schoolId: "school-1", schoolName: "Sandton Academy", grade: null, pin: null, linkedStudentId: null,
  },
  "thabo@student.co.za": {
    id: "student-1", email: "thabo@student.co.za", name: "Thabo Nkosi",
    role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "482910", linkedStudentId: null,
  },
  "aisha@student.co.za": {
    id: "student-2", email: "aisha@student.co.za", name: "Aisha Patel",
    role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "371824", linkedStudentId: null,
  },
  "priya@patel.co.za": {
    id: "parent-1", email: "priya@patel.co.za", name: "Mrs. Priya Patel",
    role: "PARENT", schoolId: null, schoolName: null, grade: null, pin: null, linkedStudentId: "student-2",
  },
};

const PASSWORDS: Record<string, string> = {
  "admin@sandtonacademy.co.za": "Admin123!",
  "n.dlamini@sandtonacademy.co.za": "Teacher123!",
  "thabo@student.co.za": "Student123!",
  "aisha@student.co.za": "Student123!",
  "priya@patel.co.za": "Parent123!",
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email;
        const expectedPassword = PASSWORDS[email];
        if (!expectedPassword || credentials.password !== expectedPassword) return null;

        const user = DEMO_USERS[email];
        if (!user) return null;

        return { ...user };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
        token.schoolName = (user as any).schoolName;
        token.grade = (user as any).grade;
        token.pin = (user as any).pin;
        token.linkedStudentId = (user as any).linkedStudentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).schoolName = token.schoolName;
        (session.user as any).grade = token.grade;
        (session.user as any).pin = token.pin;
        (session.user as any).linkedStudentId = token.linkedStudentId;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

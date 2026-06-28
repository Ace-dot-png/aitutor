import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const DEMO_USERS: Record<string, any> = {
  "admin@sandtonacademy.co.za": { id: "admin-1", email: "admin@sandtonacademy.co.za", name: "Mr. David Sithole", role: "ADMIN", schoolId: "school-1", schoolName: "Sandton Academy", grade: null, pin: null, linkedStudentId: null, language: "en" },
  "n.dlamini@sandtonacademy.co.za": { id: "teacher-1", email: "n.dlamini@sandtonacademy.co.za", name: "Ms. Nomsa Dlamini", role: "TEACHER", schoolId: "school-1", schoolName: "Sandton Academy", grade: null, pin: null, linkedStudentId: null, language: "en" },
  "thabo@student.co.za": { id: "student-1", email: "thabo@student.co.za", name: "Thabo Nkosi", role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "482910", linkedStudentId: null, language: "en" },
  "aisha@student.co.za": { id: "student-2", email: "aisha@student.co.za", name: "Aisha Patel", role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "371824", linkedStudentId: null, language: "en" },
  "priya@patel.co.za": { id: "parent-1", email: "priya@patel.co.za", name: "Mrs. Priya Patel", role: "PARENT", schoolId: null, schoolName: null, grade: null, pin: null, linkedStudentId: "student-2", language: "en" },
  "maryke.daughter@aitutor.co.za": { id: "student-client-1", email: "maryke.daughter@aitutor.co.za", name: "Maryke se dogter", role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "629104", linkedStudentId: null, language: "en" },
  "maryke@aitutor.co.za": { id: "parent-client-1", email: "maryke@aitutor.co.za", name: "Maryke", role: "PARENT", schoolId: null, schoolName: null, grade: null, pin: null, linkedStudentId: "student-client-1", language: "en" },
};

const PASSWORDS: Record<string, string> = {
  "admin@sandtonacademy.co.za": "Admin123!", "n.dlamini@sandtonacademy.co.za": "Teacher123!",
  "thabo@student.co.za": "Student123!", "aisha@student.co.za": "Student123!",
  "priya@patel.co.za": "Parent123!", "maryke.daughter@aitutor.co.za": "Demo2025!",
  "maryke@aitutor.co.za": "Demo2025!",
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email;
        const password = credentials.password;

        // Try real database first
        try {
          const user = await prisma.user.findUnique({ where: { email }, include: { school: true } });
          if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
              return { id: user.id, email: user.email, name: user.name, role: user.role, schoolId: user.schoolId, schoolName: user.school?.name ?? null, grade: user.grade, pin: user.pin, linkedStudentId: user.linkedStudentId, language: (user as any).language ?? "en" };
            }
          }
        } catch { /* DB unavailable, fall back to demo */ }

        // Fallback to demo users
        const expectedPassword = PASSWORDS[email];
        if (!expectedPassword || password !== expectedPassword) return null;
        const demoUser = DEMO_USERS[email];
        if (!demoUser) return null;
        return { ...demoUser };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role; token.schoolId = (user as any).schoolId; token.schoolName = (user as any).schoolName; token.grade = (user as any).grade; token.pin = (user as any).pin; token.linkedStudentId = (user as any).linkedStudentId; token.language = (user as any).language ?? "en"; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; (session.user as any).schoolId = token.schoolId; (session.user as any).schoolName = token.schoolName; (session.user as any).grade = token.grade; (session.user as any).pin = token.pin; (session.user as any).linkedStudentId = token.linkedStudentId; (session.user as any).language = token.language; }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

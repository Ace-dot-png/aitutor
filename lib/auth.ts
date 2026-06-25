import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const DEMO_USERS: Record<string, any> = {
  "admin@sandtonacademy.co.za": {
    id: "admin-1", email: "admin@sandtonacademy.co.za", name: "Mr. David Sithole",
    role: "ADMIN", schoolId: "school-1", schoolName: "Sandton Academy", grade: null, pin: null, linkedStudentId: null,
  },
  "n.dlamini@sandtonacademy.co.za": {
    id: "teacher-1", email: "n.dlamini@sandtonacademy.co.za", name: "Ms. Nomsa Dlamini",
    role: "TEACHER", schoolId: "school-1", schoolName: "Sandton Academy", grade: null, pin: null, linkedStudentId: null,
  },
  "j.mokoena@sandtonacademy.co.za": {
    id: "teacher-2", email: "j.mokoena@sandtonacademy.co.za", name: "Mr. James Mokoena",
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
  "sipho@student.co.za": {
    id: "student-3", email: "sipho@student.co.za", name: "Sipho Mokoena",
    role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "293847", linkedStudentId: null,
  },
  "lerato@student.co.za": {
    id: "student-4", email: "lerato@student.co.za", name: "Lerato Khumalo",
    role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G11", pin: "847291", linkedStudentId: null,
  },
  "zara@student.co.za": {
    id: "student-5", email: "zara@student.co.za", name: "Zara Williams",
    role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G12", pin: "193847", linkedStudentId: null,
  },
  "priya@patel.co.za": {
    id: "parent-1", email: "priya@patel.co.za", name: "Mrs. Priya Patel",
    role: "PARENT", schoolId: null, schoolName: null, grade: null, pin: null, linkedStudentId: "student-2",
  },
  // NEW CLIENT ACCOUNTS
  "maryke.daughter@aitutor.co.za": {
    id: "student-client-1", email: "maryke.daughter@aitutor.co.za", name: "Maryke se dogter",
    role: "STUDENT", schoolId: "school-1", schoolName: "Sandton Academy", grade: "G10", pin: "629104", linkedStudentId: null,
  },
  "maryke@aitutor.co.za": {
    id: "parent-client-1", email: "maryke@aitutor.co.za", name: "Maryke",
    role: "PARENT", schoolId: null, schoolName: null, grade: null, pin: null, linkedStudentId: "student-client-1",
  },
};

const PASSWORDS: Record<string, string> = {
  "admin@sandtonacademy.co.za": "Admin123!",
  "n.dlamini@sandtonacademy.co.za": "Teacher123!",
  "j.mokoena@sandtonacademy.co.za": "Teacher123!",
  "thabo@student.co.za": "Student123!",
  "aisha@student.co.za": "Student123!",
  "sipho@student.co.za": "Student123!",
  "lerato@student.co.za": "Student123!",
  "zara@student.co.za": "Student123!",
  "priya@patel.co.za": "Parent123!",
  "maryke.daughter@aitutor.co.za": "Demo2025!",
  "maryke@aitutor.co.za": "Demo2025!",
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
        token.id = (user as any).id; token.role = (user as any).role;
        token.schoolId = (user as any).schoolId; token.schoolName = (user as any).schoolName;
        token.grade = (user as any).grade; token.pin = (user as any).pin;
        token.linkedStudentId = (user as any).linkedStudentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id; (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId; (session.user as any).schoolName = token.schoolName;
        (session.user as any).grade = token.grade; (session.user as any).pin = token.pin;
        (session.user as any).linkedStudentId = token.linkedStudentId;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

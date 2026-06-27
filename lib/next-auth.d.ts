import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      grade?: string;
      schoolId?: string;
      schoolName?: string;
      linkedStudentId?: string;
      pin?: string;
      language?: string;
    };
  }
  interface User {
    id: string;
    role: string;
    grade?: string;
    schoolId?: string;
    schoolName?: string;
    linkedStudentId?: string;
    pin?: string;
    language?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    grade?: string;
    schoolId?: string;
    schoolName?: string;
    linkedStudentId?: string;
    pin?: string;
    language?: string;
  }
}

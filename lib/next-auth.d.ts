import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      schoolId?: string | null;
      schoolName?: string | null;
      grade?: string | null;
      pin?: string | null;
      linkedStudentId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    schoolId?: string | null;
    schoolName?: string | null;
    grade?: string | null;
    pin?: string | null;
    linkedStudentId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    schoolId?: string | null;
    schoolName?: string | null;
    grade?: string | null;
    pin?: string | null;
    linkedStudentId?: string | null;
  }
}

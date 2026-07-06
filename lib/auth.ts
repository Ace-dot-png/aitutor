import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseUrl = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const DEMO: Record<string, any> = {
          "admin@sandtonacademy.co.za": { id:"a1",email:"admin@sandtonacademy.co.za",name:"Mr. David Sithole",role:"ADMIN",schoolId:"s1",schoolName:"Sandton Academy",grade:undefined,pin:undefined,linkedStudentId:undefined,language:"en" },
          "n.dlamini@sandtonacademy.co.za": { id:"t1",email:"n.dlamini@sandtonacademy.co.za",name:"Ms. Nomsa Dlamini",role:"TEACHER",schoolId:"s1",schoolName:"Sandton Academy",grade:undefined,pin:undefined,linkedStudentId:undefined,language:"en" },
          "thabo@student.co.za": { id:"s1",email:"thabo@student.co.za",name:"Thabo Nkosi",role:"STUDENT",schoolId:"s1",schoolName:"Sandton Academy",grade:"G10",pin:"482910",linkedStudentId:undefined,language:"en" },
          "maryke.daughter@aitutor.co.za": { id:"sc1",email:"maryke.daughter@aitutor.co.za",name:"Maryke se dogter",role:"STUDENT",schoolId:"s1",schoolName:"Sandton Academy",grade:"G10",pin:"629104",linkedStudentId:undefined,language:"en" },
          "maryke@aitutor.co.za": { id:"pc1",email:"maryke@aitutor.co.za",name:"Maryke",role:"PARENT",schoolId:undefined,schoolName:undefined,grade:undefined,pin:undefined,linkedStudentId:"sc1",language:"en" },
          "priya@patel.co.za": { id:"p1",email:"priya@patel.co.za",name:"Mrs. Priya Patel",role:"PARENT",schoolId:undefined,schoolName:undefined,grade:undefined,pin:undefined,linkedStudentId:"s1",language:"en" },
          "Maryke@testing.com": { id:"nt1",email:"Maryke@testing.com",name:"Maryke",role:"PARENT",schoolId:undefined,schoolName:undefined,grade:undefined,pin:undefined,linkedStudentId:"ns1",language:"en" },
          "Klara@testing.com": { id:"ns1",email:"Klara@testing.com",name:"Klara",role:"STUDENT",schoolId:"s1",schoolName:"Sandton Academy",grade:"G10",pin:"847362",linkedStudentId:undefined,language:"en" },
          "admin@testing.com": { id:"na1",email:"admin@testing.com",name:"Admin",role:"ADMIN",schoolId:"s1",schoolName:"Sandton Academy",grade:undefined,pin:undefined,linkedStudentId:undefined,language:"en" },
        };
        const PWD: Record<string,string> = {
          "admin@sandtonacademy.co.za":"Admin123!","n.dlamini@sandtonacademy.co.za":"Teacher123!","thabo@student.co.za":"Student123!","maryke.daughter@aitutor.co.za":"Demo2025!","maryke@aitutor.co.za":"Demo2025!","priya@patel.co.za":"Parent123!","Maryke@testing.com":"Demo2026!","Klara@testing.com":"Demo2026!","admin@testing.com":"Demo2026!",
        };
        if (!credentials?.email || !credentials?.password) return null;
        if (PWD[credentials.email] === credentials.password && DEMO[credentials.email]) return DEMO[credentials.email];
        return null;
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

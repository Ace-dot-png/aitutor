import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count();
    const admin = await prisma.user.findFirst({ where: { email: "admin@sandtonacademy.co.za" }, select: { name: true, role: true } });
    return Response.json({ db_ok: true, userCount: count, adminFound: !!admin, admin });
  } catch (e: any) {
    return Response.json({ db_ok: false, error: e.message, code: e.code }, { status: 500 });
  }
}

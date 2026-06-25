import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding client test accounts...");

  const password = await bcrypt.hash("Demo2025!", 10);
  const school = await prisma.school.findFirst({ where: { name: "Sandton Academy" } });
  const class10A = await prisma.class.findFirst({ where: { name: "10A", schoolId: school?.id } });

  if (!school || !class10A) {
    console.error("School or class not found. Run main seed first.");
    return;
  }

  // Student
  const student = await prisma.user.upsert({
    where: { email: "maryke.daughter@aitutor.co.za" },
    update: {},
    create: {
      email: "maryke.daughter@aitutor.co.za",
      password,
      name: "Maryke se dogter",
      role: "STUDENT",
      schoolId: school.id,
      grade: "G10",
      pin: "629104",
    },
  });

  // Enroll
  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: class10A.id, studentId: student.id } },
    update: {},
    create: { classId: class10A.id, studentId: student.id },
  });

  // Parent
  const parent = await prisma.user.upsert({
    where: { email: "maryke@aitutor.co.za" },
    update: { linkedStudentId: student.id },
    create: {
      email: "maryke@aitutor.co.za",
      password,
      name: "Maryke",
      role: "PARENT",
      linkedStudentId: student.id,
    },
  });

  console.log(`Student: ${student.email} (PIN: 629104)`);
  console.log(`Parent: ${parent.email} (linked to ${student.name})`);
  console.log("Done!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

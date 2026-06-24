import { PrismaClient, Role, Subject, Grade, SentimentLabel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Sandton Academy...");

  const password = await bcrypt.hash("Admin123!", 10);
  const teacherPassword = await bcrypt.hash("Teacher123!", 10);
  const studentPassword = await bcrypt.hash("Student123!", 10);
  const parentPassword = await bcrypt.hash("Parent123!", 10);

  // School
  const school = await prisma.school.create({
    data: { name: "Sandton Academy", curriculumType: "CAPS" },
  });

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@sandtonacademy.co.za",
      password,
      name: "Mr. David Sithole",
      role: "ADMIN",
      schoolId: school.id,
    },
  });

  // Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: "n.dlamini@sandtonacademy.co.za",
      password: teacherPassword,
      name: "Ms. Nomsa Dlamini",
      role: "TEACHER",
      schoolId: school.id,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: "j.mokoena@sandtonacademy.co.za",
      password: teacherPassword,
      name: "Mr. James Mokoena",
      role: "TEACHER",
      schoolId: school.id,
    },
  });

  // Classes
  const class10A = await prisma.class.create({
    data: { name: "10A", grade: "G10", schoolId: school.id },
  });
  const class11A = await prisma.class.create({
    data: { name: "11A", grade: "G11", schoolId: school.id },
  });
  const class12A = await prisma.class.create({
    data: { name: "12A", grade: "G12", schoolId: school.id },
  });

  // Teacher assignments
  await prisma.classTeacher.createMany({
    data: [
      { classId: class10A.id, teacherId: teacher1.id, subject: "MATHEMATICS" },
      { classId: class10A.id, teacherId: teacher1.id, subject: "PHYSICS" },
      { classId: class11A.id, teacherId: teacher1.id, subject: "MATHEMATICS" },
      { classId: class11A.id, teacherId: teacher1.id, subject: "PHYSICS" },
      { classId: class10A.id, teacherId: teacher2.id, subject: "ENGLISH" },
      { classId: class11A.id, teacherId: teacher2.id, subject: "ENGLISH" },
      { classId: class12A.id, teacherId: teacher2.id, subject: "ENGLISH" },
    ],
  });

  // Students
  const thabo = await prisma.user.create({
    data: { email: "thabo@student.co.za", password: studentPassword, name: "Thabo Nkosi", role: "STUDENT", schoolId: school.id, grade: "G10", pin: "482910" },
  });
  const aisha = await prisma.user.create({
    data: { email: "aisha@student.co.za", password: studentPassword, name: "Aisha Patel", role: "STUDENT", schoolId: school.id, grade: "G10", pin: "371824" },
  });
  const sipho = await prisma.user.create({
    data: { email: "sipho@student.co.za", password: studentPassword, name: "Sipho Mokoena", role: "STUDENT", schoolId: school.id, grade: "G10", pin: "293847" },
  });
  const lerato = await prisma.user.create({
    data: { email: "lerato@student.co.za", password: studentPassword, name: "Lerato Khumalo", role: "STUDENT", schoolId: school.id, grade: "G11", pin: "847291" },
  });
  const zara = await prisma.user.create({
    data: { email: "zara@student.co.za", password: studentPassword, name: "Zara Williams", role: "STUDENT", schoolId: school.id, grade: "G12", pin: "193847" },
  });

  // Enroll students in classes
  await prisma.classStudent.createMany({
    data: [
      { classId: class10A.id, studentId: thabo.id },
      { classId: class10A.id, studentId: aisha.id },
      { classId: class10A.id, studentId: sipho.id },
      { classId: class11A.id, studentId: lerato.id },
      { classId: class12A.id, studentId: zara.id },
    ],
  });

  // Parent
  const parent = await prisma.user.create({
    data: { email: "priya@patel.co.za", password: parentPassword, name: "Mrs. Priya Patel", role: "PARENT", linkedStudentId: aisha.id },
  });

  // Subject enrollment
  const subjects: Subject[] = ["MATHEMATICS", "PHYSICS", "ENGLISH"];
  for (const classId of [class10A.id, class11A.id, class12A.id]) {
    for (const subject of subjects) {
      await prisma.classSubject.create({ data: { classId, subject } });
    }
  }

  // Seeded sessions and analyses
  const students = [
    { student: thabo, scenarios: generateScenarios(thabo.id, "G10", "positive", 60, 80) },
    { student: aisha, scenarios: generateScenarios(aisha.id, "G10", "struggling", 20, 45) },
    { student: sipho, scenarios: generateScenarios(sipho.id, "G10", "positive", 75, 95) },
    { student: lerato, scenarios: generateScenarios(lerato.id, "G11", "neutral", 50, 70) },
    { student: zara, scenarios: generateScenarios(zara.id, "G12", "positive", 45, 88) },
  ];

  for (const { student, scenarios } of students) {
    for (const sc of scenarios) {
      const session = await prisma.session.create({
        data: {
          studentId: student.id,
          subject: sc.subject,
          topic: sc.topic,
          grade: sc.grade as Grade,
          startedAt: sc.startedAt,
          endedAt: new Date(sc.startedAt.getTime() + 30 * 60 * 1000),
        },
      });

      await prisma.message.createMany({
        data: [
          { sessionId: session.id, role: "user", content: sc.userMsg },
          { sessionId: session.id, role: "assistant", content: sc.assistantMsg },
        ],
      });

      await prisma.sessionAnalysis.create({
        data: {
          sessionId: session.id,
          sentimentLabel: sc.sentiment,
          sentimentScore: sc.sentimentScore,
          knowledgeGainScore: sc.knowledgeGainScore,
          painPoints: sc.painPoints,
          breakthroughMoments: sc.breakthroughs,
          teacherNote: sc.teacherNote,
          parentNote: sc.parentNote,
        },
      });

      await prisma.learnerStats.upsert({
        where: { studentId_subject_topicId: { studentId: student.id, subject: sc.subject, topicId: sc.topicId } },
        create: {
          studentId: student.id,
          subject: sc.subject,
          topicId: sc.topicId,
          topicTitle: sc.topic,
          sessionsCount: 1,
          masteryScore: sc.knowledgeGainScore,
          lastActive: sc.startedAt,
        },
        update: {
          sessionsCount: { increment: 1 },
          masteryScore: sc.knowledgeGainScore,
          lastActive: sc.startedAt,
        },
      });
    }
  }

  console.log("Seed complete!");
  console.log("---");
  console.log("Admin:   admin@sandtonacademy.co.za / Admin123!");
  console.log("Teacher: n.dlamini@sandtonacademy.co.za / Teacher123!");
  console.log("Student: thabo@student.co.za / Student123! (PIN: 482910)");
  console.log("Student: aisha@student.co.za / Student123! (PIN: 371824) — struggling");
  console.log("Parent:  priya@patel.co.za / Parent123! (linked to Aisha)");
}

function generateScenarios(studentId: string, grade: string, mood: string, minGain: number, maxGain: number) {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  const scenarios = [];

  if (mood === "struggling") {
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Algebraic Expressions", topicId: "m10_1", grade,
      startedAt: daysAgo(1), userMsg: "I don't get factorisation at all.", assistantMsg: "Let's break it down. Factorisation is like reverse multiplication...",
      sentiment: "STRUGGLING" as SentimentLabel, sentimentScore: 25, knowledgeGainScore: rand(20, 30),
      painPoints: ["Factorisation"], breakthroughs: [],
      teacherNote: "Aisha is struggling with basic factorisation. Recommend small-group intervention.", parentNote: "Aisha found factorisation tricky today. Extra practice would help.",
    });
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Exponents and Surds", topicId: "m10_2", grade,
      startedAt: daysAgo(3), userMsg: "What are surds?", assistantMsg: "A surd is a root that can't be simplified to a whole number...",
      sentiment: "DISENGAGED" as SentimentLabel, sentimentScore: 15, knowledgeGainScore: rand(15, 25),
      painPoints: ["Laws of exponents"], breakthroughs: [],
      teacherNote: "Aisha disengaged during exponents. Needs foundational revision.", parentNote: "Aisha seemed a bit lost with exponents today. We'll try a different approach next time.",
    });
    scenarios.push({
      subject: "PHYSICS" as Subject, topic: "Chemical Change", topicId: "p10_6", grade,
      startedAt: daysAgo(5), userMsg: "How do I balance equations?", assistantMsg: "Balancing equations means making sure atoms are equal on both sides...",
      sentiment: "STRUGGLING" as SentimentLabel, sentimentScore: 30, knowledgeGainScore: rand(25, 35),
      painPoints: ["Balancing equations"], breakthroughs: [],
      teacherNote: "Aisha struggling with stoichiometry basics. Needs one-on-one.", parentNote: "Balancing chemical equations is proving difficult for Aisha. Extra worksheets would help.",
    });
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Equations and Inequalities", topicId: "m10_3", grade,
      startedAt: daysAgo(7), userMsg: "x² + 5x + 6 = 0 how?", assistantMsg: "This is a quadratic. Let's factor it first...",
      sentiment: "STRUGGLING" as SentimentLabel, sentimentScore: 20, knowledgeGainScore: rand(20, 40),
      painPoints: ["Quadratic equations"], breakthroughs: [],
      teacherNote: "Continuing difficulty with quadratics. Consider after-school support.", parentNote: "Quadratic equations are still a challenge. We're working on building confidence.",
    });
    scenarios.push({
      subject: "ENGLISH" as Subject, topic: "Reading and Comprehension", topicId: "e10_1", grade,
      startedAt: daysAgo(9), userMsg: "I read the passage but don't understand it.", assistantMsg: "Let's read it together slowly. What's the first sentence about?",
      sentiment: "NEUTRAL" as SentimentLabel, sentimentScore: 45, knowledgeGainScore: rand(40, 55),
      painPoints: ["Inferential comprehension"], breakthroughs: [],
      teacherNote: "Aisha needs support with inference and deeper reading.", parentNote: "Reading comprehension is steady but needs more work on reading between the lines.",
    });
    scenarios.push({
      subject: "PHYSICS" as Subject, topic: "Energy", topicId: "p10_2", grade,
      startedAt: daysAgo(12), userMsg: "What's kinetic energy?", assistantMsg: "Kinetic energy is the energy of motion...",
      sentiment: "STRUGGLING" as SentimentLabel, sentimentScore: 30, knowledgeGainScore: rand(30, 45),
      painPoints: ["Conservation of energy"], breakthroughs: [],
      teacherNote: "Energy conservation concept not landing. Use physical demonstrations.", parentNote: "The energy topic is tricky. Visual examples would help at home too.",
    });
  } else if (mood === "positive") {
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Trigonometry", topicId: "m10_4", grade,
      startedAt: daysAgo(1), userMsg: "SOHCAHTOA — I got sin and cos mixed up.", assistantMsg: "Sin is Opposite/Hypotenuse. Cos is Adjacent/Hypotenuse. Let's practise.",
      sentiment: "POSITIVE" as SentimentLabel, sentimentScore: 75, knowledgeGainScore: rand(65, 80),
      painPoints: ["Trigonometric ratios"], breakthroughs: ["SOHCAHTOA"],
      teacherNote: "Good engagement with trig basics. Minor confusion resolved quickly.", parentNote: "Great session on trigonometry! Your child grasped SOHCAHTOA well.",
    });
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Functions and Graphs", topicId: "m10_5", grade,
      startedAt: daysAgo(3), userMsg: "How do I sketch y = 2x + 3?", assistantMsg: "Find the y-intercept first, then use the slope...",
      sentiment: "POSITIVE" as SentimentLabel, sentimentScore: 80, knowledgeGainScore: rand(70, 85),
      painPoints: [], breakthroughs: ["Linear functions"],
      teacherNote: "Strong grasp of linear functions. Ready for quadratics.", parentNote: "Excellent work on graphs today! Moving on to more advanced functions soon.",
    });
    scenarios.push({
      subject: "PHYSICS" as Subject, topic: "Energy", topicId: "p10_2", grade,
      startedAt: daysAgo(5), userMsg: "Conservation of energy — is it always true?", assistantMsg: "In a closed system, yes. Energy transforms, never disappears...",
      sentiment: "POSITIVE" as SentimentLabel, sentimentScore: 85, knowledgeGainScore: rand(75, 90),
      painPoints: [], breakthroughs: ["Conservation of energy"],
      teacherNote: "Excellent conceptual understanding. Asking insightful questions.", parentNote: "Brilliant session! Your child is asking really thoughtful questions about energy.",
    });
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Equations and Inequalities", topicId: "m10_3", grade,
      startedAt: daysAgo(7), userMsg: "Simultaneous equations — substitution or elimination?", assistantMsg: "Either works. Elimination is often faster for these...",
      sentiment: "NEUTRAL" as SentimentLabel, sentimentScore: 60, knowledgeGainScore: rand(55, 75),
      painPoints: ["Simultaneous equations"], breakthroughs: [],
      teacherNote: "Solid with individual methods. Needs more practice choosing between them.", parentNote: "Good effort on simultaneous equations. A bit more practice on method selection.",
    });
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Euclidean Geometry", topicId: "m10_6", grade,
      startedAt: daysAgo(10), userMsg: "Why are opposite angles equal?", assistantMsg: "Let's prove it with intersecting lines...",
      sentiment: "POSITIVE" as SentimentLabel, sentimentScore: 78, knowledgeGainScore: rand(70, 85),
      painPoints: [], breakthroughs: ["Angle relationships"],
      teacherNote: "Natural geometric intuition. Enjoys proofs.", parentNote: "Geometry is going very well! Your child enjoys working through proofs.",
    });
    scenarios.push({
      subject: "ENGLISH" as Subject, topic: "Writing", topicId: "e10_3", grade,
      startedAt: daysAgo(14), userMsg: "How do I start an essay?", assistantMsg: "Start with a hook — a surprising fact, question, or vivid scene...",
      sentiment: "POSITIVE" as SentimentLabel, sentimentScore: 72, knowledgeGainScore: rand(65, 80),
      painPoints: [], breakthroughs: ["Essay planning"],
      teacherNote: "Good essay structure emerging. Needs to develop voice.", parentNote: "Essay writing is improving nicely. Your child has good ideas — now working on structure.",
    });
  } else {
    // neutral
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Trigonometry", topicId: "m11_4", grade,
      startedAt: daysAgo(2), userMsg: "Reduction formulae — when do I use them?", assistantMsg: "When angles are bigger than 90°. Let me show you...",
      sentiment: "NEUTRAL" as SentimentLabel, sentimentScore: 55, knowledgeGainScore: rand(50, 65),
      painPoints: ["Reduction formulae"], breakthroughs: [],
      teacherNote: "Passable understanding. Needs more drill exercises.", parentNote: "A steady session. Reduction formulae need a bit more practice.",
    });
    scenarios.push({
      subject: "PHYSICS" as Subject, topic: "Newtons Laws", topicId: "p11_1", grade,
      startedAt: daysAgo(4), userMsg: "Newton's second law — F = ma?", assistantMsg: "Exactly. Force equals mass times acceleration...",
      sentiment: "NEUTRAL" as SentimentLabel, sentimentScore: 60, knowledgeGainScore: rand(55, 70),
      painPoints: ["Friction"], breakthroughs: [],
      teacherNote: "Understands the basics. Friction calculations need work.", parentNote: "Making progress with Newton's laws. Friction is the next challenge.",
    });
    scenarios.push({
      subject: "ENGLISH" as Subject, topic: "Writing", topicId: "e11_3", grade,
      startedAt: daysAgo(6), userMsg: "Argumentative vs discursive — what's the difference?", assistantMsg: "Argumentative takes a side and defends it. Discursive explores both...",
      sentiment: "POSITIVE" as SentimentLabel, sentimentScore: 68, knowledgeGainScore: rand(60, 75),
      painPoints: [], breakthroughs: ["Essay types"],
      teacherNote: "Clear understanding of essay types now. Ready for practice essays.", parentNote: "Good clarity on different essay types. Time to start writing practice essays!",
    });
    scenarios.push({
      subject: "MATHEMATICS" as Subject, topic: "Number Patterns", topicId: "m11_2", grade,
      startedAt: daysAgo(9), userMsg: "Arithmetic vs geometric — how to tell?", assistantMsg: "Arithmetic adds a constant difference. Geometric multiplies by a constant ratio...",
      sentiment: "NEUTRAL" as SentimentLabel, sentimentScore: 50, knowledgeGainScore: rand(45, 60),
      painPoints: ["Geometric sequences"], breakthroughs: [],
      teacherNote: "Can identify sequences but struggles with general term formula.", parentNote: "Working on number patterns. Geometric sequences still a bit tricky.",
    });
  }

  return scenarios;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

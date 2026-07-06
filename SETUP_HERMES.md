# aiTutor — Hermes Agent Handover
## For: Hermes Agent + DeepSeek v4
## Stable build date: June 2026

---

## WHAT THIS IS

A fully functional AI tutoring platform for South African CAPS/IEB curriculum (Grades 4-12).
Built with Next.js 14, Prisma, NextAuth, OpenAI, Tailwind CSS, Recharts.
Deployed via ngrok tunnel or Railway/Vercel.

## HOW TO RUN IMMEDIATELY

1. Unzip this folder.
2. Open a terminal in the unzipped folder.
3. Run: `npm install`
4. Run: `npm run dev -- -p 3003`
5. Open: `http://localhost:3003/login`

Login credentials (instant demo auth, no database needed):
- admin@sandtonacademy.co.za / Admin123! (Admin)
- n.dlamini@sandtonacademy.co.za / Teacher123! (Teacher)
- thabo@student.co.za / Student123! (Student)
- maryke.daughter@aitutor.co.za / Demo2025! (Student, Grade 10, IEB)
- maryke@aitutor.co.za / Demo2025! (Parent, linked to above student)
- priya@patel.co.za / Parent123! (Parent, linked to Thabo)
- Maryke@testing.com / Demo2026! (Parent)
- Klara@testing.com / Demo2026! (Student, Grade 10, PIN 847362)
- admin@testing.com / Demo2026! (Admin)

## HOW TO EXPOSE PUBLICLY (ngrok)

1. Install ngrok: `npm install -g ngrok` or download from ngrok.com
2. Sign up at ngrok.com (free), get authtoken from dashboard
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. In a new terminal: `ngrok http 3003`
5. Copy the public URL (ends in .ngrok-free.dev)
6. Update .env.local: set NEXTAUTH_URL to that URL
7. Restart the app: `npm run dev -- -p 3003` and restart ngrok
8. Users must click "Visit Site" on the first ngrok interstitial page (one-time)
9. Share the ngrok URL. Login works after clicking through.

NOTE: If login hangs on "Signing in..." through ngrok, the ngrok free tier
interstitial page breaks NextAuth's CSRF flow. Either:
- Have users access via localhost:3003 directly, OR
- Upgrade ngrok to remove the interstitial page, OR
- Deploy to Railway (see below)

## HOW TO DEPLOY TO RAILWAY

1. Push this project to GitHub.
2. Go to railway.app, log in with GitHub.
3. New Project > Deploy from GitHub repo > select this repo.
4. Add environment variables from .env.local:
   - OPENAI_API_KEY
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to Railway URL after first deploy)
5. Deploy. Railway handles the rest.

## ARCHITECTURE NOTES FOR THE NEXT HERMES

- Auth uses hardcoded demo credentials (instant, no DB dependency).
  This was done because Neon PostgreSQL connection times out from Vercel/Railway.
  To add new users: edit the DEMO and PWD objects in lib/auth.ts.
- The tutor chat streams from OpenAI (gpt-4o-mini model).
  OPENAI_API_KEY in .env.local must be valid.
- Dashboards use hardcoded demo data (not real database queries).
  The admin, teacher, student, and parent dashboards all have static data.
- Prisma/Neon is configured but not required for basic functionality.
  The seed script (prisma/seed.ts) populates the database if connected.
- All 19 pages have `export const dynamic = 'force-dynamic'` for proper
  server rendering on Railway.
- Subject curriculum covers G4-G12 with Maths, Physics, English, Afrikaans,
  Accounting, Business, Economics, Geography, History, Life Sciences, and more.
- i18n: English/Afrikaans toggle on login and in nav bar. All UI strings
  are in lib/i18n.ts.
- Language toggle works by switching localStorage and React context.

## FILE STRUCTURE KEY

- lib/auth.ts — NextAuth config with demo users
- lib/i18n.ts — All UI strings (English + Afrikaans)
- lib/prompts/tutorPrompt.ts — AI tutor system prompt
- lib/prompts/analysisPrompt.ts — Session analysis prompt
- lib/prompts/lessonPlanPrompt.ts — Lesson planner prompt
- lib/subjectMap.ts — Maps subject keys to Prisma enum values
- lib/gradeMap.ts — Maps grade strings to Prisma enum values
- app/api/tutor/route.ts — Streaming tutor chat endpoint
- app/api/session-analysis/route.ts — Post-session AI analysis
- app/api/lesson-plan/route.ts — Teacher lesson planner
- prisma/schema.prisma — Database schema (Neon PostgreSQL)
- prisma/seed.ts — Seed data (Sandton Academy)
- data/curriculum.json — Full CAPS/IEB curriculum G4-G12
- railway.json — Railway deployment config

## CRITICAL WARNINGS

- Do NOT delete or modify lib/auth.ts unless you understand the demo auth system.
- The NEXTAUTH_SECRET in .env.local is tied to existing cookies.
  Changing it will invalidate all sessions.
- ngrok free tier injects an interstitial page. This is expected.
  Users click "Visit Site" once, then it never appears again for that user.
- The machine running ngrok must stay on and connected to internet.

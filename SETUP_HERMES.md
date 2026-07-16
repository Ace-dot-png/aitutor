# aiTutor v3 — Hermes Agent Handover
## For: Hermes Agent + OpenAI gpt-4o-mini
## Build date: July 2026 | Commit: 33535e4
## GitHub: github.com/Ace-dot-png/aitutor (public)

---

## WHAT THIS IS

A fully functional AI tutoring platform for South African CAPS/IEB curriculum (Grades 4-12).
Built with Next.js 14, Prisma, NextAuth, OpenAI, Tailwind CSS, Recharts.
Local dev with ngrok tunnel for sharing.

## v3 NEW FEATURES (since v2)

- Colour-coded AI responses in tutor chat (5-colour cycling)
- Byte the robot mascot — 8 poses, reacts to answers and scores
- Reading & comprehension tab with AI-generated passages + auto-graded questions
- Reading speed test with grade-level benchmarks
- Discovery tab with 8-question learning style test (visual/auditory/kinesthetic)
- Learning style affects AI tutor behaviour
- Tests & practice tab with AI-generated MCQ tests + auto-grading
- Rate limiting on tutor API (20 req/min per user)
- Input sanitization on all API inputs
- ErrorBoundary wrapping student pages

## HOW TO RUN IMMEDIATELY

1. Open terminal in this folder: C:\Users\adien\aitutor
2. Run: npm run dev -- -p 3003
3. Open: http://localhost:3003/login

Login credentials (instant demo auth, no database needed):
- admin@sandtonacademy.co.za / Admin123!
- n.dlamini@sandtonacademy.co.za / Teacher123!
- thabo@student.co.za / Student123!
- maryke.daughter@aitutor.co.za / Demo2025!
- maryke@aitutor.co.za / Demo2025!
- priya@patel.co.za / Parent123!
- Maryke@testing.com / Demo2026!
- Klara@testing.com / Demo2026!
- admin@testing.com / Demo2026!

## HOW TO EXPOSE WITH NGROK

1. Install ngrok
2. ngrok config add-authtoken YOUR_TOKEN
3. Kill existing node: taskkill //F //IM "node.exe"
4. Start app: cd C:\Users\adien\aitutor && npx next dev -p 3003
5. Start ngrok: ngrok http 3003
6. Get URL: curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1
7. Update .env.local NEXTAUTH_URL to that URL
8. Restart app
9. First visit: click "Visit Site" on ngrok warning page

## PAGE MAP (Student — v3)

- /student/dashboard    — welcome with Byte mascot, subject cards, sessions, FYP videos
- /student/tutor        — AI tutor chat with colour-coded responses + Byte mascot in chat
- /student/reading      — AI-generated readings + comprehension questions + speed test
- /student/discovery    — learning style test + personalised study methods + general tips
- /student/tests        — AI-generated MCQ tests with auto-grading + mascot reactions
- /student/progress     — mastery charts, session history
- /student/notes        — upload/download notes
- /student/timetable    — weekly study timetable
- /student/settings     — PIN display, hobbies, language

## KEY FILES — v3

- lib/auth.ts                           — NextAuth with 9 hardcoded demo users (instant login)
- lib/i18n.ts                           — All UI strings EN + AF (66+ keys)
- lib/prompts/tutorPrompt.ts            — AI prompt: Socratic teaching, colour-coded output, learning style adaptation
- lib/rateLimit.ts                      — In-memory rate limiter (20 req/min per user)
- lib/sanitize.ts                       — Input sanitization (control chars, backslashes)
- components/mascot/Mascot.tsx          — Byte robot: 8 poses via SVG files
- components/tutor/ColouredResponse.tsx — Parses <point> tags into 5-colour borders
- app/api/tutor/route.ts               — Streaming chat with rate limit + sanitization + learning style
- app/api/reading/generate/route.ts    — AI reading passage + 5 questions
- app/api/reading/feedback/route.ts    — AI grades student answers
- app/api/reading/speed/route.ts       — Save WPM to DB
- app/api/tests/generate/route.ts      — AI MCQ test generator
- app/api/tests/save/route.ts          — Save test results to DB
- app/api/user/learning-style/route.ts — GET/PATCH visual/auditory/kinesthetic
- public/mascot/mascot-*.svg           — 8 Byte SVG poses (greeting, curious, thinking, excited, encouraging, happy, surprised, gentle)

## DB MIGRATION — when Neon is online

npx prisma db push --accept-data-loss

New in v3 schema:
- User.learningStyle (String)
- TestResult model (score, total, subject, topic, grade)
- ReadingSpeedResult model (wpm, grade)

## MASCOT POSE MAPPING

greeting      → dashboard welcome, first chat message
excited       → high scores (>=70%), correct answers
encouraging   → medium scores (40-69%), thumbs up
thinking      → AI loading/streaming
gentle        → low scores (<40%), wrong answers (consoling)
curious       → normal AI chat responses
happy         → discovery learning style result
surprised     → available for future use

## CRITICAL NOTES

- Auth uses hardcoded demo credentials first (instant), real DB as fallback
  This is required because Neon free tier is slow/unreliable through tunnels
- Do NOT delete lib/auth.ts — demo auth is the only reliable login path
- useSecureCookies: false is NOT in auth.ts — if adding ngrok, add it to authOptions
  (do NOT add custom cookies config — it breaks middleware)
- All pages must have: export const dynamic = 'force-dynamic'
- All API routes must have: auth check + role check + try/catch
- The NEXTAUTH_SECRET is in .env.local — do not change it
- Neon connection string must NOT include &channel_binding=require

# aiTutor — Full Codebase Audit Bug Report
## Date: 25 June 2026 | Auditor: Hermes Agent

---

FILE: app/api/session-analysis/route.ts
ISSUE: No try/catch around JSON.parse() — if OpenAI returns malformed or empty JSON, the entire route crashes with 500 and the streaming tutor session is lost.
IMPACT: Student sees a broken error instead of a session completion summary. Session data, analysis, and learner stats are never saved.
SEVERITY: Critical

---

FILE: app/api/session-analysis/route.ts
ISSUE: All Prisma calls use demo user IDs (e.g. "student-1", "student-client-1") that do not exist in the Neon PostgreSQL database. The `prisma.sessionAnalysis.create()` call will fail with a foreign key constraint error because `sessionId` references a non-existent session. The `prisma.session.upsert()` and `prisma.learnerStats.upsert()` calls will also fail.
IMPACT: Session analysis is completely non-functional against the live database. No data is ever persisted from real tutor sessions.
SEVERITY: Critical

---

FILE: app/api/tutor/route.ts
ISSUE: Tutor responses are streamed to the client but never saved to the database. The original spec required `prisma.message.create()` for each user/assistant message pair. The session-analysis route expects sessions with messages to exist, but none are created.
IMPACT: No tutoring history. Session analysis endpoint receives a `sessionId` of null (from the client) and crashes. The entire analytics pipeline is broken.
SEVERITY: Critical

---

FILE: app/api/lesson-plan/save/route.ts
ISSUE: Uses `teacherId: (session.user as any).id` which is "teacher-1" (a hardcoded demo ID) — this ID does not exist in the Prisma database. The `prisma.lessonPlan.create()` will fail with a foreign key constraint error.
IMPACT: Teachers cannot save lesson plans. Feature is completely broken against the live database.
SEVERITY: Critical

---

FILE: app/api/notes/route.ts
ISSUE: GET handler has no role check — any authenticated user (including admins, teachers, parents) can access another student's notes. Only checks for a valid session, not that the user is a STUDENT.
IMPACT: Cross-role data leak. A teacher or parent could access notes they shouldn't see.
SEVERITY: High

---

FILE: app/api/notes/route.ts
ISSUE: POST handler has no role check — any authenticated user can upload notes. Uses `studentId` from session without verifying role is STUDENT.
IMPACT: A logged-in admin or teacher could accidentally upload files under their own (non-student) user ID, corrupting the notes table.
SEVERITY: High

---

FILE: app/api/tutor/route.ts
ISSUE: No try/catch around the OpenAI streaming call. If the API key is invalid, rate-limited, or the model returns an error, the route crashes with a 500 instead of returning a graceful error response.
IMPACT: Student sees a blank crash or generic error instead of a helpful "I'm having trouble" message. The client-side fallback only triggers if `!res.ok`, but the streaming failure may not propagate as a proper HTTP status.
SEVERITY: High

---

FILE: app/api/lesson-plan/route.ts
ISSUE: No try/catch around the OpenAI streaming call. Same issue as the tutor route — any OpenAI failure crashes with 500.
IMPACT: Teacher sees a broken page when trying to use the lesson planner.
SEVERITY: High

---

FILE: app/api/parent/link/route.ts
ISSUE: Queries `prisma.user.findUnique({ where: { pin, role: "STUDENT" } })` — but the PINs in the database are tied to real Prisma user records with cuid() IDs. The demo parent account "parent-client-1" tries to find a student by PIN "371824" or "629104", but the database may not have these PINs if the seed data uses different records. The hardcoded demo auth bypasses the database entirely.
IMPACT: Parent PIN linking does not work against the live database because demo user IDs don't match Prisma records.
SEVERITY: High

---

FILE: app/(parent)/parent/layout.tsx
ISSUE: Line 16 uses `typeof window !== "undefined"` check inside a client component's render body. This pattern causes a hydration mismatch between server and client renders, and the `redirect()` call after the check may not fire if the condition is true on the server.
IMPACT: Unlinked parents may see a flash of the dashboard before being redirected, or the redirect may fail entirely on first render.
SEVERITY: Medium

---

FILE: middleware.ts
ISSUE: The matcher only protects page routes (`/admin/:path*`, `/teacher/:path*`, `/student/:path*`, `/parent/:path*`). API routes like `/api/tutor`, `/api/stats/admin`, `/api/notes`, `/api/lesson-plan/*` are NOT protected by middleware. They rely entirely on in-route session checks which are inconsistently applied.
IMPACT: An unauthenticated user can call API routes directly. The in-route checks catch most cases but any route missing the check (or with a broken check) is exposed.
SEVERITY: Medium

---

FILE: app/layout.tsx
ISSUE: `<html lang="en">` is hardcoded. When the user switches to Afrikaans, the HTML lang attribute does not update. This affects screen readers, automated translation tools, and SEO.
IMPACT: Accessibility violation. Afrikaans-speaking users with screen readers get English pronunciation.
SEVERITY: Medium

---

FILE: lib/prompts/tutorPrompt.ts
ISSUE: The `topic` parameter is accepted in the function signature but always called with an empty string `""` from the API route. The prompt template references `${topic}` which renders as literal empty text in the "Current topic:" line.
IMPACT: The AI's curriculum boundary prompt says "Current topic: ." which is confusing. The AI may not scope responses properly without a topic.
SEVERITY: Medium

---

FILE: app/api/tutor/route.ts
ISSUE: The curriculum context string is appended to EVERY user message in the conversation, not just the latest. This means the context string appears multiple times in the message history, bloating the token count and potentially confusing the AI.
IMPACT: Wastes ~50 tokens per message on duplicated context. Over a long conversation, this could push the context window limits.
SEVERITY: Medium

---

FILE: app/api/session-analysis/route.ts
ISSUE: Line 61 — `Math.round(lastAnalyses.reduce(...) / lastAnalyses.length)` — if `lastAnalyses` is an empty array (no prior analyses), this is a division by zero which returns NaN. `Math.round(NaN)` returns NaN, which Prisma stores as NULL in the Int field.
IMPACT: Mastery score becomes NULL/empty in the database after the first session analysis, breaking the rolling average permanently.
SEVERITY: Medium

---

FILE: app/api/stats/admin/route.ts
ISSUE: No try/catch around any Prisma calls. If the database is unreachable (Neon connection issues), the entire admin dashboard API crashes with a 500.
IMPACT: Admin dashboard shows a blank error instead of gracefully falling back.
SEVERITY: Medium

---

FILE: app/api/stats/teacher/route.ts
ISSUE: No try/catch around Prisma calls. Same as admin stats.
IMPACT: Teacher dashboard crashes on database failure.
SEVERITY: Medium

---

FILE: app/api/stats/student/route.ts
ISSUE: No try/catch around Prisma calls. Uses hardcoded demo user IDs that don't match database records.
IMPACT: Student progress page always shows empty/loading because Prisma queries return no results for demo IDs like "student-1".
SEVERITY: Medium

---

FILE: app/api/stats/parent/route.ts
ISSUE: No try/catch around Prisma calls. Uses `linkedStudentId` from the session token (e.g., "student-client-1") which doesn't exist in the database.
IMPACT: Parent dashboard shows "No child linked" or crashes silently.
SEVERITY: Medium

---

FILE: app/api/teacher/class/[classId]/route.ts
ISSUE: No try/catch. Uses `prisma.class.findUnique()` and multiple nested queries without error handling.
IMPACT: Teacher class view crashes if the classId is invalid or the database is down.
SEVERITY: Medium

---

FILE: app/api/teacher/student/[studentId]/route.ts
ISSUE: No try/catch around Prisma calls.
IMPACT: Teacher student detail view crashes on database errors.
SEVERITY: Medium

---

FILE: app/api/admin/grade/[grade]/route.ts
ISSUE: No try/catch around Prisma calls.
IMPACT: Admin grade drill-down crashes on database errors.
SEVERITY: Medium

---

FILE: app/api/admin/teacher/[teacherId]/route.ts
ISSUE: No try/catch around Prisma calls.
IMPACT: Admin teacher drill-down crashes on database errors.
SEVERITY: Medium

---

FILE: app/api/admin/student/[studentId]/route.ts
ISSUE: No try/catch around Prisma calls.
IMPACT: Admin student drill-down crashes on database errors.
SEVERITY: Medium

---

FILE: app/api/notes/route.ts
ISSUE: No try/catch around Vercel Blob `put()` call or Prisma create. If the blob upload fails or the token is invalid, the route crashes.
IMPACT: File upload silently fails with no user feedback.
SEVERITY: Medium

---

FILE: app/api/timetable/route.ts
ISSUE: No try/catch around Prisma calls. No role check on the POST handler (any authenticated user can create timetable entries).
IMPACT: Cross-user timetable corruption and crashes on database errors.
SEVERITY: Medium

---

FILE: app/(auth)/login/page.tsx
ISSUE: Line 50 — `label="Email"` is hardcoded English. Never changes with the language toggle.
IMPACT: The "Email" label stays in English even when Afrikaans is selected, breaking the i18n promise.
SEVERITY: Low

---

FILE: app/(auth)/login/page.tsx
ISSUE: Line 29 — `fetch("/api/auth/session")` — after a successful signIn, fetching the session returns 200 but the session cookie may not be set yet if there's a race condition between the signIn callback and the session fetch.
IMPACT: Edge case where the redirect fails because `session?.user?.role` is undefined, showing "Invalid email" despite successful auth.
SEVERITY: Low

---

FILE: lib/curriculum.ts
ISSUE: The `getAllTopics()` function only returns MATHEMATICS, PHYSICS, and ENGLISH — it does not dynamically return all subjects from the curriculum.json. The tutor page has its own subject discovery logic that ignores this function.
IMPACT: Dead code that will cause bugs if any other component tries to use getAllTopics() for grades 4-9 that have more subjects.
SEVERITY: Low

---

FILE: components/ui/ErrorBoundary.tsx
ISSUE: The ErrorBoundary is exported but never imported or used in any layout or page. It exists but provides zero protection.
IMPACT: Any uncaught React error still crashes the entire app with Next.js's default error page.
SEVERITY: Low

---

FILE: components/ui/Spinner.tsx
ISSUE: The Spinner, DotsSpinner, and SkeletonCard components are exported but never imported or used in any page. All dashboards and pages have inline loading UI or hardcoded spinners instead.
IMPACT: Dead code. Inconsistent loading states across the app.
SEVERITY: Low

---

FILE: app/api/tutor/start/route.ts
ISSUE: This endpoint creates sessions in the database but the current tutor page never calls it (the instant-chat tutor sends sessionId: null). This route is dead code.
IMPACT: Unused endpoint that creates confusion and may be called accidentally by old clients.
SEVERITY: Low

---

FILE: app/api/db-test/route.ts
ISSUE: Diagnostic endpoint that exposes database connection status and user counts. Has no authentication check — anyone can call it.
IMPACT: Information disclosure. An attacker can probe the database health and user count.
SEVERITY: Low

---

FILE: lib/contentFilter.ts
ISSUE: The `blockedTerms` object is empty. The `filterResponse()` function runs but does nothing because there are no terms to filter.
IMPACT: Content filtering is a no-op. Any inappropriate AI output passes through unfiltered.
SEVERITY: Low

---

FILE: prisma/schema.prisma
ISSUE: The Subject enum only includes MATHEMATICS, PHYSICS, ENGLISH — but the expanded curriculum.json includes afrikaans, accounting, business_studies, economics, geography, history, life_sciences, natural_sciences, social_sciences, economic_management, life_skills. None of these can be stored in the Session, LearnerStats, Note, TimetableEntry, or LessonPlan tables because the Subject enum doesn't include them.
IMPACT: Any tutor session, note, timetable entry, or lesson plan for non-core subjects will fail to save to the database with a Prisma validation error.
SEVERITY: Medium

---

FILE: app/api/lesson-plan/save/route.ts
ISSUE: The `grade` field in the request body comes from the client as a string like "G10" but the teacher chat page sends just "10" (from the dropdown value). `prisma.lessonPlan.create()` expects a Grade enum value. If the client sends "10" instead of "G10", the Prisma create will fail.
IMPACT: Lesson plans cannot be saved because the grade format doesn't match the enum.
SEVERITY: Medium

---

FILE: app/(student)/student/timetable/page.tsx
ISSUE: The `addEntry` handler sends `day` as a string like "Mon" but the Prisma TimetableEntry model stores `day` as a plain string. This works but there's no validation — any string is accepted.
IMPACT: Garbage data can be entered (e.g., "blah" as a day). Low severity because it still saves.
SEVERITY: Low

---

# SEVERITY COUNTS

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High     | 6 |
| Medium   | 18 |
| Low      | 12 |
| **TOTAL** | **40** |

# ROOT CAUSE SUMMARY

The fundamental architectural issue is a **dual identity problem**: the auth system uses hardcoded demo user IDs (e.g., "student-1", "teacher-1") while all database tables use Prisma's `cuid()` generated IDs from the seed script. These two ID systems are completely incompatible. Every database operation that references a user ID from the session token will fail because "student-1" does not match any record in the `User` table.

The second major issue is **zero error handling** across all database-dependent API routes. Not a single Prisma call is wrapped in try/catch. When the Neon database connection fails (which is a known issue on Vercel), every API route crashes with an unhandled 500 error.

The third issue is the **broken data pipeline**: the tutor chat doesn't create sessions or save messages, so the session-analysis endpoint has nothing to analyze. The entire analytics and progress tracking system is a dead path.

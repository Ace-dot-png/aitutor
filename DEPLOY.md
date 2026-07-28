# aiTutor — Deployment Guide

## Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon serverless — `neondb_owner` pooler URL)
- **ORM:** Prisma 5
- **Auth:** NextAuth.js (Credentials provider — swap for real auth in production)
- **AI:** OpenAI gpt-4o-mini
- **UI:** Tailwind CSS, Recharts

## Environment Variables (.env)
```
DATABASE_URL="postgresql://neondb_owner:xxx@ep-billowing-bird-a5qlqj0m-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:xxx@ep-billowing-bird-a5qlqj0m.us-east-2.aws.neon.tech/neondb?sslmode=require"
OPENAI_API_KEY="sk-..."
NEXTAUTH_SECRET="any-random-string-here"
NEXTAUTH_URL="http://localhost:3000"  # change to your domain
```

## Deployment Steps

### 1. Clone & Install
```
git clone <repo-url>
cd aitutor
npm install
```

### 2. Database Setup
```
npx prisma generate
npx prisma db push
```

### 3. Production Build
```
npm run build
npm start
```

### 4. Or use any Next.js host
- Vercel (drag-and-drop)
- Railway
- DigitalOcean App Platform
- Any Docker host

## What to Replace for Production
1. **Auth:** Replace `lib/auth.ts` demo credentials with real DB auth
2. **Database:** Swap Neon URL with your production DB
3. **OpenAI:** Add your production API key
4. **Mascot:** Replace `public/mascot/*.svg` with real mascot artwork (8 poses)
5. **Curriculum:** Update `data/curriculum.json` with full Cambridge/IEB data

## Current Demo Logins
```
Admin:   admin@sandtonacademy.co.za / Admin123!
Teacher: n.dlamini@sandtonacademy.co.za / Teacher123!
Student: thabo@student.co.za / Student123!
Parent:  priya@patel.co.za / Parent123!
```

## Project Structure
```
aitutor/
├── app/
│   ├── (admin)/admin/      # Admin dashboard + user management
│   ├── (parent)/parent/    # Parent PIN link + dashboard
│   ├── (student)/student/  # Student: dashboard, tutor, reading, discovery, tests, maths
│   ├── (teacher)/teacher/  # Teacher dashboard + lesson planner
│   ├── api/                # All API routes
│   └── login/              # Login page
├── components/             # Reusable UI components
├── lib/                    # Auth, i18n, prompts, rate limiting, sanitize
├── prisma/                 # Database schema
├── public/                 # Static assets (mascot SVGs, logo)
└── data/                   # curriculum.json
```

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin") && token?.role !== "ADMIN") return NextResponse.redirect(new URL("/login", req.url));
    if (path.startsWith("/teacher") && token?.role !== "TEACHER") return NextResponse.redirect(new URL("/login", req.url));
    if (path.startsWith("/student") && token?.role !== "STUDENT") return NextResponse.redirect(new URL("/login", req.url));
    if (path.startsWith("/parent") && path !== "/parent/link" && token?.role !== "PARENT") return NextResponse.redirect(new URL("/login", req.url));
    if (path.startsWith("/api/tutor") && token?.role !== "STUDENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (path.startsWith("/api/lesson-plan") && token?.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (path.startsWith("/api/stats/admin") && token?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (path.startsWith("/api/stats/teacher") && token?.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (path.startsWith("/api/stats/student") && token?.role !== "STUDENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (path.startsWith("/api/stats/parent") && token?.role !== "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/admin/:path*","/teacher/:path*","/student/:path*","/parent/:path*","/api/tutor/:path*","/api/session-analysis/:path*","/api/lesson-plan/:path*","/api/stats/:path*","/api/notes/:path*","/api/timetable/:path*","/api/teacher/:path*","/api/admin/:path*","/api/parent/:path*","/api/reading/:path*","/api/tests/:path*","/api/user/:path*"],
};

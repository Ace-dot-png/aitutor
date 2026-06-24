"use client";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="font-silkscreen text-4xl text-text-primary mb-2">;)</div>
        <div className="font-aharoni text-2xl text-text-primary tracking-wider mb-4">aiTutor</div>
        <div className="card p-6 space-y-4">
          <p className="text-text-secondary text-sm">
            Registration is managed by your school administrator.
          </p>
          <p className="text-text-muted text-xs">
            Please contact your school admin to create an account.
          </p>
          <Link href="/login" className="btn-primary inline-block text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

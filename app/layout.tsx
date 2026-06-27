"use client";
import { useLang } from "@/lib/LanguageContext";
import "./globals.css";
import Providers from "@/components/Providers";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary">
        <LanguageProvider>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </LanguageProvider>
      </body>
    </html>
  );
}

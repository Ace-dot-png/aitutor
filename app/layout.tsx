import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "aiTutor",
  description: "AI-powered tutoring for South African high schools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-text-primary">
        <LanguageProvider>
          <Providers>{children}</Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}

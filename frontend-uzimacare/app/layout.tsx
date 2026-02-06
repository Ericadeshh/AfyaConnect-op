// app/layout.tsx
// NO "use client" here — keep as Server Component for metadata
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "UzimaCare – Digital Healthcare Referrals",
  description: "Streamlining patient referrals between facilities in Kenya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ClientProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}

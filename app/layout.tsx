import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "SwiftCiv Sales Agent",
  description: "Monitor and manage the automated sales pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen lg:h-screen lg:overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 min-h-screen lg:min-h-0">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import { DesktopSidebar } from "@/components/DesktopSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DPDPComply - India's DPDP Act compliance tool",
  description: "India's DPDP Act compliance tool for startups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen pb-16 md:pb-0">
        <div className="flex min-h-screen">
          <DesktopSidebar />
          <main className="flex-1 w-full max-w-full">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}

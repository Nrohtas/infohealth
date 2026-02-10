import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard ข้อมูลสุขภาพจังหวัดพิษณุโลก",
  description: "ระบบรายงานสถิติข้อมูลสุขภาพและประชากร จังหวัดพิษณุโลก",
  icons: {
    icon: "/image/logo_digital_health.png",
  },
};

import Header from "@/components/Header";
import UtilityBar from "@/components/UtilityBar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans`}
      >
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <UtilityBar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}


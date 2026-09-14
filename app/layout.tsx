import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Lexora | AI Legal Document Understanding & Risk Analysis",
  description:
    "Understand the fine print. Before it matters. AI-powered legal document understanding, risk detection, comparison and guidance — designed for everyone.",
  keywords: [
    "legal AI",
    "contract analysis",
    "document comparison",
    "risk detection",
    "legal assistant",
    "legal tech",
    "plain english contracts",
  ],
  authors: [{ name: "Lexora Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-200">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

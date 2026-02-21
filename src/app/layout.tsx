import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ÖzüSocial | Sadece Kampüs",
  description: "Özyeğin Üniversitesi öğrencileri için özel sosyal ağ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900 selection:bg-rose-500 selection:text-white`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}

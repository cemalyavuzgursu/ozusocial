import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniVibe | Sadece Kampüs",
  description: "Özyeğin Üniversitesi öğrencileri için özel sosyal ağ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 selection:bg-rose-500 selection:text-white`}
      >
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

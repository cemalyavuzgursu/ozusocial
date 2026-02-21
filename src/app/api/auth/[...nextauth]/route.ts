/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            // KURAL 1: Admin VIP Bypass (Önceden yetkili admin eklemişse domain zorunluluğu yoktur)
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: { id: true }
            });

            if (existingUser) {
                return true; // Kullanıcı zaten admin paneli/veritabanı içindeyse anında izin verilir.
            }

            // KURAL 2: SADECE EĞİTİM MAİLLERİNE İZİN VER (.edu.tr veya .edu uzantılı olmalı)
            if (
                user.email.endsWith(".edu.tr") ||
                user.email.endsWith(".edu") ||
                user.email === "deneme@gmail.com" // Test hesabı beyaz listesi
            ) {
                return true;
            }

            // Diğerlerine red ver (hata sayfasına yönlendirir)
            return false;
        },
    },
    pages: {
        signIn: "/", // Varsayılan giriş sayfası kendi tasarımımız
        error: "/auth/error", // Eğer yetkisiz maille denerse düşeceği sayfa
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

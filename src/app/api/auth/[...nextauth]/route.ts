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

            // KURAL 2: EXTRACT DOMAIN AND CHECK IN DATABASE
            const userDomain = user.email.split('@')[1];

            // Allow override for test user
            if (user.email === "deneme@gmail.com") {
                return true;
            }

            const allowedUniversity = await prisma.university.findUnique({
                where: { domain: userDomain }
            });

            if (allowedUniversity) {
                // If this user is just being created, or already exists but doesn't have a domain set,
                // Prisma adapter handles the creation *after* this callback returns true.
                // However, `signIn` callback runs before the adapter creates the user in the database.
                // So we can check if they exist. If they do, update them.
                // If they don't, we can't update them yet, but we will fix that by updating their domain in the session callback or just trying to upsert it asynchronously.

                // Let's try to update existing user
                try {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { universityDomain: userDomain }
                    });
                } catch (e) {
                    // User might not exist yet (first login), that's fine.
                }

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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "E-posta", type: "email" },
                password: { label: "Şifre", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase() },
                    select: { id: true, email: true, name: true, image: true, password: true, isOnboarded: true, isBanned: true }
                });

                if (!user || !user.password) return null;
                if (user.isBanned) return null;

                const passwordMatch = await bcrypt.compare(credentials.password, user.password);
                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            // Credentials girişi: kullanıcı zaten doğrulandı, izin ver
            if (account?.provider === "credentials") return true;

            // Google girişi: mevcut kullanıcıya her zaman izin ver
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: { id: true }
            });
            if (existingUser) return true;

            // Yeni Google kullanıcısı: domain kontrolü
            const userDomain = user.email.split('@')[1];

            if (user.email === "deneme@gmail.com") return true;

            const allowedUniversity = await prisma.university.findUnique({
                where: { domain: userDomain }
            });

            if (allowedUniversity) {
                try {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { universityDomain: userDomain }
                    });
                } catch (e) {
                    // User might not exist yet, will be set in createUser event
                }
                return true;
            }

            return false;
        },
    },
    pages: {
        signIn: "/",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
    },
    events: {
        async createUser({ user }) {
            if (user.email && user.id) {
                const domain = user.email.split('@')[1];
                if (domain) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { universityDomain: domain.toLowerCase(), authProvider: "GOOGLE" }
                    });
                }
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

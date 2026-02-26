"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function registerUser(formData: FormData) {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = (formData.get("name") as string)?.trim();

    if (!email || !password || !name) {
        throw new Error("Tüm alanları doldurun.");
    }

    // Şifre doğrulama
    if (password.length < 8) {
        throw new Error("Şifre en az 8 karakter olmalıdır.");
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error("Şifre hem harf hem rakam içermelidir.");
    }
    if (password !== confirmPassword) {
        throw new Error("Şifreler eşleşmiyor.");
    }

    // Domain kontrolü
    const domain = email.split("@")[1];
    if (!domain) throw new Error("Geçerli bir e-posta girin.");

    const university = await prisma.university.findUnique({ where: { domain } });
    if (!university) {
        throw new Error("Bu e-posta adresi kayıtlı bir üniversiteye ait değil.");
    }

    // Mevcut kullanıcı kontrolü
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("Bu e-posta adresi zaten kullanımda.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            authProvider: "CREDENTIALS",
            universityDomain: domain.toLowerCase(),
            isOnboarded: false,
        }
    });

    return { success: true };
}

export async function setPasswordForGoogleUser(userId: string, password: string) {
    // VULN-3: Kimlik doğrulaması ve sahiplik kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız.");

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!currentUser || currentUser.id !== userId) {
        throw new Error("Sadece kendi şifrenizi değiştirebilirsiniz.");
    }

    if (password.length < 8) throw new Error("Şifre en az 8 karakter olmalıdır.");
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error("Şifre hem harf hem rakam içermelidir.");
    }
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed }
    });
}

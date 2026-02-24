"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function completeOnboarding(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const birthYearData = formData.get("birthYear");
    const department = formData.get("department")?.toString();
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    const birthYear = birthYearData ? parseInt(birthYearData.toString(), 10) : null;

    if (!department || !birthYear) {
        redirect("/onboarding?error=missing_fields");
    }

    if (birthYear < 1900 || birthYear > new Date().getFullYear()) {
        redirect("/onboarding?error=invalid_year");
    }

    // Şifre doğrulama (Google kullanıcıları için)
    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, authProvider: true, password: true }
    });

    let hashedPassword: string | undefined;

    if (dbUser?.authProvider === "GOOGLE" && !dbUser.password) {
        // Google kullanıcısı — şifre zorunlu
        if (!password) redirect("/onboarding?error=missing_password");
        if (password.length < 8) redirect("/onboarding?error=weak_password");
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) redirect("/onboarding?error=weak_password");
        if (password !== confirmPassword) redirect("/onboarding?error=password_mismatch");
        hashedPassword = await bcrypt.hash(password, 12);
    }

    // 25 yaş kontrolü
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age > 25) {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                birthYear,
                department,
                isOnboarded: false,
                isPendingAgeReview: true,
                ...(hashedPassword ? { password: hashedPassword } : {})
            }
        });
        redirect("/onboarding?status=pending_review");
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            birthYear,
            department,
            isOnboarded: true,
            ...(hashedPassword ? { password: hashedPassword } : {})
        }
    });

    revalidatePath("/feed");
    redirect("/feed");
}

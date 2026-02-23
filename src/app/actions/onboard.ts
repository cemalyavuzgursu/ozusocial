"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const birthYearData = formData.get("birthYear");
    const department = formData.get("department")?.toString();

    const birthYear = birthYearData ? parseInt(birthYearData.toString(), 10) : null;

    if (!department || !birthYear) {
        redirect("/onboarding?error=missing_fields");
    }

    if (birthYear < 1900 || birthYear > new Date().getFullYear()) {
        redirect("/onboarding?error=invalid_year");
    }

    // 25 yaş kontrolü
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age > 25) {
        // Kullanıcıyı admin incelemesine al, sisteme alma
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                birthYear,
                department,
                isOnboarded: false,
                isPendingAgeReview: true
            }
        });
        redirect("/onboarding?status=pending_review");
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            birthYear,
            department,
            isOnboarded: true
        }
    });

    revalidatePath("/feed");
    redirect("/feed");
}

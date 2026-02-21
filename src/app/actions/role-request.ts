"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function requestClubRole(message: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return { error: "Oturum bulunamadı. Lütfen giriş yapın." };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { roleRequests: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!user) return { error: "Kullanıcı bulunamadı." };

    if (user.role === "CLUB") {
        return { error: "Zaten bir kulüp hesabınız var." };
    }

    // Zaten beklemede bir başvuru varsa engelle
    if (user.roleRequests.length > 0 && user.roleRequests[0].status === "PENDING") {
        return { error: "Şu anda değerlendirmede olan bir başvurunuz zaten var." };
    }

    try {
        await prisma.roleRequest.create({
            data: {
                userId: user.id,
                message: message,
                status: "PENDING"
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Kulüp başvurusu hatası:", error);
        return { error: "Başvuru oluşturulurken bir hata oluştu." };
    }
}

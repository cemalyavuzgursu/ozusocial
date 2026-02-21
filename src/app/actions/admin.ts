"use server";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Sadece oturumlu adminlerin yapabildiği eylemler

export async function approveRequest(requestId: string, targetUserId: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    try {
        // 1. İsteği onaylandı olarak işaretle
        await prisma.roleRequest.update({
            where: { id: requestId },
            data: { status: "APPROVED" }
        });

        // 2. Kullanıcı rolünü "CLUB" yap
        await prisma.user.update({
            where: { id: targetUserId },
            data: { role: "CLUB" }
        });

        revalidatePath("/admin");
    } catch (error) {
        console.error("Başvuru onaylanırken hata oluştu:", error);
    }
}

export async function rejectRequest(requestId: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    try {
        // İsteği reddedildi olarak işaretle
        await prisma.roleRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });

        revalidatePath("/admin");
    } catch (error) {
        console.error("Başvuru reddedilirken hata oluştu:", error);
    }
}

export async function searchUsers(query: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    if (!query || query.trim().length === 0) return [];

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isBanned: true
        },
        take: 10
    });

    return users;
}

export async function toggleBanUser(userId: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    await prisma.user.update({
        where: { id: userId },
        data: { isBanned: !user.isBanned }
    });

    revalidatePath("/admin");
    return !user.isBanned;
}

export async function deleteUser(userId: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    // Yöneticinin var olan kullanıcıyı kalıcı olarak silebilmesi
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    // Cascade ayarlandığı için Account, Session, Post, vb. de silinmeli (schema'ya bağlı)
    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath("/admin");
    return true;
}

export async function changeUserRole(userId: string, newRole: "STUDENT" | "CLUB" | "ADMIN") {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    const validRoles = ["STUDENT", "CLUB", "ADMIN"];
    if (!validRoles.includes(newRole)) {
        throw new Error("Geçersiz rol tipi.");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin");
    return newRole;
}

export async function createUser(data: { name: string; email: string; role: "STUDENT" | "CLUB" | "ADMIN" }) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    if (!data.email || !data.name) {
        throw new Error("E-posta ve isim zorunludur.");
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("Bu e-posta adresine sahip bir kullanıcı zaten mevcut.");
    }

    await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            role: data.role,
            isOnboarded: false // İlk girişte onboard ekranını görsünler
        }
    });

    revalidatePath("/admin");
    return true;
}

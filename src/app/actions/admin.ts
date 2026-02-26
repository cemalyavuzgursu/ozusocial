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

export async function toggleBanUser(userId: string, durationDays: number | null = null) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    let banExpiresAt = null;
    let isBanned = !user.isBanned;

    // If we're banning the user and a duration is provided, calculate the expiry date
    if (isBanned && durationDays !== null) {
        banExpiresAt = new Date();
        banExpiresAt.setDate(banExpiresAt.getDate() + durationDays);
    } // else: Unbanning, or Banning indefinitely (banExpiresAt = null)

    // If the user is currently banned and no duration is passed or we just want to remove the ban
    // we assume the intent is to unban if called without specific duration but they are already banned
    if (user.isBanned) {
        isBanned = false;
        banExpiresAt = null;
    } else {
        isBanned = true;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned,
            banExpiresAt
        }
    });

    revalidatePath("/admin");
    return isBanned;
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

    // VULN-13: E-posta format doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error("Geçerli bir e-posta adresi girin.");
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

// === ÜNİVERSİTE YÖNETİMİ ===

export async function getUniversities() {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    const universities = await prisma.university.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { users: true } } }
    });

    return universities;
}

export async function createUniversity(name: string, domain: string, departments?: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    if (!name || !domain) {
        throw new Error("Üniversite adı ve uzantısı zorunludur.");
    }

    // Clean domain (e.g. remove @ if user types @ozu.edu.tr)
    const cleanDomain = domain.replace('@', '').trim().toLowerCase();

    const existing = await prisma.university.findUnique({
        where: { domain: cleanDomain }
    });

    if (existing) {
        throw new Error("Bu uzantıya sahip bir üniversite zaten mevcut.");
    }

    await prisma.university.create({
        data: {
            name: name.trim(),
            domain: cleanDomain,
            departments: departments ? departments.trim() : null
        }
    });

    revalidatePath("/admin");
    return true;
}

export async function updateUniversityDepartments(id: string, departments: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    await prisma.university.update({
        where: { id },
        data: {
            departments: departments ? departments.trim() : null
        }
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/university/${id}`);
    return true;
}

export async function updateUniversity(id: string, name: string, domain: string, departments: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    if (!name || !domain) {
        throw new Error("Üniversite adı ve uzantısı zorunludur.");
    }

    const cleanDomain = domain.replace('@', '').trim().toLowerCase();

    // Check if domain is taken by ANOTHER university
    const existing = await prisma.university.findFirst({
        where: { domain: cleanDomain, id: { not: id } }
    });

    if (existing) {
        throw new Error("Bu uzantıya sahip başka bir üniversite zaten mevcut.");
    }

    await prisma.university.update({
        where: { id },
        data: {
            name: name.trim(),
            domain: cleanDomain,
            departments: departments ? departments.trim() : null
        }
    });

    // Domain changed? We should ideally update users' universityDomain to match the new one, but for now we let NextAuth handle new logins or let the relational aspect ride. 
    // Wait, users rely on `universityDomain`. If domain changes, they lose connection. 
    // We update all users who had the old domain!
    const oldUni = await prisma.university.findUnique({ where: { id }, select: { domain: true } });
    if (oldUni && oldUni.domain !== cleanDomain) {
        await prisma.user.updateMany({
            where: { universityDomain: oldUni.domain },
            data: { universityDomain: cleanDomain }
        });
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/university/${id}`);
    return true;
}

export async function deleteUniversity(id: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    await prisma.university.delete({
        where: { id }
    });

    revalidatePath("/admin");
    return true;
}

export async function getUniversityById(id: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    const university = await prisma.university.findUnique({
        where: { id },
        include: { _count: { select: { users: true } } }
    });

    if (!university) throw new Error("Üniversite bulunamadı.");

    const users = await prisma.user.findMany({
        where: { universityDomain: university.domain },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
        },
        orderBy: { name: 'asc' }
    });

    return { university, users };
}

// === ŞÜPHELİ ONBOARDING (YAŞ İNCELEMESİ) ===

export async function getSuspiciousOnboardingUsers() {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    const users = await prisma.user.findMany({
        where: { isPendingAgeReview: true },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            birthYear: true,
            department: true,
            universityDomain: true,
            university: { select: { name: true } }
        },
        orderBy: { email: 'asc' }
    });

    return users;
}

export async function approveAgeReview(userId: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            isOnboarded: true,
            isPendingAgeReview: false
        }
    });

    revalidatePath("/admin");
    return true;
}

export async function rejectAgeReview(userId: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz işlem.");
    }

    // Kullanıcıyı tamamen sil
    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath("/admin");
    return true;
}

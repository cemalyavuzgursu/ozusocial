"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createReport(targetType: "POST" | "COMMENT" | "USER", targetId: string, reason: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });
    if (!user) throw new Error("Kullanıcı bulunamadı");

    // Prevent duplicate reports for the same target that are still pending
    const existingReport = await prisma.report.findFirst({
        where: {
            reporterId: user.id,
            targetId,
            status: "PENDING"
        }
    });

    if (existingReport) {
        throw new Error("Bu içeriği zaten raporladınız ve henüz incelenmedi.");
    }

    await prisma.report.create({
        data: {
            reporterId: user.id,
            targetType,
            targetId,
            reason,
            status: "PENDING"
        }
    });

    return { success: true };
}

export async function resolveReport(reportId: string, action: "REJECT" | "DELETE_TARGET") {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) throw new Error("Yetkiniz yok");

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error("Rapor bulunamadı");

    if (action === "REJECT") {
        await prisma.report.update({
            where: { id: reportId },
            data: { status: "REJECTED" }
        });
    } else if (action === "DELETE_TARGET") {
        try {
            if (report.targetType === "POST") {
                await prisma.post.delete({ where: { id: report.targetId } });
            } else if (report.targetType === "COMMENT") {
                await prisma.comment.delete({ where: { id: report.targetId } });
            } else if (report.targetType === "USER") {
                await prisma.user.update({
                    where: { id: report.targetId },
                    data: { isBanned: true } // Silmek yerine kalıcı banla
                });
            }

            // İçerik silindiği için duruma RESOLVED yaz
            await prisma.report.update({
                where: { id: reportId },
                data: { status: "RESOLVED" }
            });
            // Aynı hedefe yönelik tğm bekleyen raporları da çözülmüş yap
            await prisma.report.updateMany({
                where: { targetId: report.targetId, targetType: report.targetType, status: "PENDING" },
                data: { status: "RESOLVED" }
            });

        } catch (e) {
            console.error("Deletion failed", e);
            throw new Error("Hedef silinirken bir hata oluştu veya zaten silinmiş.");
        }
    }

    revalidatePath("/admin");
    return { success: true };
}

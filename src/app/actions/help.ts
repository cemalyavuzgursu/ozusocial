"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";

export async function createSupportTicket(data: { category: string; description: string; mediaUrl?: string }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        throw new Error("Oturum açmanız gerekiyor.");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        throw new Error("Kullanıcı bulunamadı.");
    }

    if (!data.category || !data.description || data.description.trim() === "") {
        throw new Error("Kategori ve açıklama zorunludur.");
    }

    const ticket = await prisma.supportTicket.create({
        data: {
            userId: user.id,
            category: data.category,
            description: data.description,
            mediaUrl: data.mediaUrl || null,
        }
    });

    return ticket.id;
}

export async function updateTicketStatus(id: string, newStatus: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz erişim");
    }

    await prisma.supportTicket.update({
        where: { id },
        data: { status: newStatus }
    });

    revalidatePath("/admin");
    return true;
}

export async function deleteTicket(id: string) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        throw new Error("Yetkisiz erişim");
    }

    await prisma.supportTicket.delete({
        where: { id }
    });

    revalidatePath("/admin");
    return true;
}

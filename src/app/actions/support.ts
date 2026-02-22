"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Kullanıcı için destek talebi oluşturma
export async function createSupportTicket(category: string, description: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Oturum bulunamadı");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });
    if (!user) throw new Error("Kullanıcı bulunamadı");

    const ticket = await prisma.supportTicket.create({
        data: {
            userId: user.id,
            category,
            description,
            status: "OPEN"
        }
    });

    revalidatePath("/support");
    return { success: true, ticketId: ticket.id };
}

// Ticketa mesaj gönderme (Kullanıcı veya Admin)
export async function sendSupportMessage(ticketId: string, content: string, isAdmin: boolean) {
    const session = await getServerSession(authOptions);
    // (Oturum kontrolü admin/kullanıcı ayrımına göre sayfalarda yapılacak)

    const sender = session?.user?.email ? await prisma.user.findUnique({
        where: { email: session.user.email }, select: { id: true }
    }) : null;

    if (!sender && !isAdmin) throw new Error("Yetkilendirme hatası");

    const message = await prisma.supportMessage.create({
        data: {
            ticketId,
            content,
            isAdmin,
            senderId: sender?.id || null
        }
    });

    // Otomatik olarak status OPEN değilse OPEN yap
    if (!isAdmin) {
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: "OPEN" }
        });
    }

    revalidatePath(`/support/${ticketId}`);
    revalidatePath(`/admin`);
    return { success: true, messageId: message.id };
}

// Admin: Ticket durumunu güncelleme
export async function updateTicketStatus(ticketId: string, status: string) {
    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status }
    });
    revalidatePath(`/admin`);
    revalidatePath(`/support/${ticketId}`);
    revalidatePath("/support");
}

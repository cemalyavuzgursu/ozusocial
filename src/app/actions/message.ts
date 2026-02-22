"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getAllowedUsersForMessages() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { following: true }
    });
    if (!currentUser) return [];

    const followingIds = currentUser.following.map(u => u.id);

    // Takip edilenler VEYA Rolü CLUB olanlar
    const allowedUsers = await prisma.user.findMany({
        where: {
            OR: [
                { id: { in: followingIds } },
                { role: "CLUB" }
            ],
            NOT: { id: currentUser.id }
        },
        select: { id: true, name: true, email: true, image: true, role: true },
        orderBy: { name: 'asc' }
    });

    return allowedUsers;
}

export async function getOrCreateConversation(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) throw new Error("Kullanıcı bulunamadı.");

    // Check if conversation already exists between these 2 users
    const existing = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { id: me.id } } },
                { participants: { some: { id: targetUserId } } }
            ]
        }
    });

    if (existing) return existing.id;

    // Create a new conversation
    const newConv = await prisma.conversation.create({
        data: {
            participants: {
                connect: [{ id: me.id }, { id: targetUserId }]
            }
        }
    });

    revalidatePath("/messages");
    return newConv.id;
}

export async function sendMessage(conversationId: string, content: string, fileUrl?: string, fileType?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    const me = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!me) throw new Error("Kullanıcı bulunamadı.");

    if ((!content || content.trim() === "") && !fileUrl) return;

    await prisma.message.create({
        data: {
            content: content.trim(),
            senderId: me.id,
            conversationId,
            fileUrl: fileUrl || null,
            fileType: fileType || null
        }
    });

    return await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });
}

export async function getMessages(conversationId: string) {
    noStore(); // Polling request should not be cached!
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, image: true } } }
    });
}

export async function getUnreadMessageCount() {
    noStore(); // Polling
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return 0;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) return 0;

    const count = await prisma.message.count({
        where: {
            isRead: false,
            senderId: { not: user.id },
            conversation: {
                participants: {
                    some: { id: user.id }
                }
            }
        }
    });

    return count;
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFollow(targetUserId: string): Promise<"FOLLOWING" | "UNFOLLOWED" | "PENDING"> {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        throw new Error("Giriş yapmalısınız!");
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, following: { select: { id: true } } },
    });

    if (!currentUser) throw new Error("Kullanıcı bulunamadı");
    if (currentUser.id === targetUserId) throw new Error("Kendinizi takip edemezsiniz");

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { isPrivate: true }
    });

    if (!targetUser) throw new Error("Hedef kullanıcı bulunamadı");

    // Check if already following
    const isFollowing = currentUser.following.some((user) => user.id === targetUserId);

    if (isFollowing) {
        // Zaten takip ediyorsa takipten çık
        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                following: { disconnect: { id: targetUserId } },
            },
        });

        revalidatePath("/feed");
        revalidatePath(`/user/${targetUserId}`);
        revalidatePath('/profile');
        return "UNFOLLOWED";
    }

    // Check for pending request if target is private
    if (targetUser.isPrivate) {
        const existingReq = await prisma.followRequest.findUnique({
            where: { senderId_receiverId: { senderId: currentUser.id, receiverId: targetUserId } }
        });

        if (existingReq) {
            // İsteği iptal et
            await prisma.followRequest.delete({
                where: { id: existingReq.id }
            });
            revalidatePath(`/user/${targetUserId}`);
            revalidatePath('/messages');
            return "UNFOLLOWED";
        } else {
            // İstek yolla
            await prisma.followRequest.create({
                data: {
                    senderId: currentUser.id,
                    receiverId: targetUserId
                }
            });
            revalidatePath(`/user/${targetUserId}`);
            revalidatePath('/messages');
            return "PENDING";
        }
    }

    // Takip et (Public Hesap)
    await prisma.user.update({
        where: { id: currentUser.id },
        data: {
            following: { connect: { id: targetUserId } },
        },
    });

    revalidatePath("/feed");
    revalidatePath(`/user/${targetUserId}`);
    revalidatePath('/profile');

    return "FOLLOWING";
}

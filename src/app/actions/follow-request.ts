"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function respondToFollowRequest(requestId: string, action: "ACCEPT" | "REJECT") {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) throw new Error("Giriş yapmalısınız!");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const request = await prisma.followRequest.findUnique({
        where: { id: requestId }
    });

    if (!request) throw new Error("İstek bulunamadı.");
    if (request.receiverId !== user.id) throw new Error("Yetkisiz işlem.");

    if (action === "ACCEPT") {
        // İsteği sil & Sender'i Receiver'a "followers" (followedBy) olarak bağla
        // Bu işlemde follower (takip eden, gönderici), followed (takip edilen, bu kullanıcı)
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    followedBy: { connect: { id: request.senderId } }
                }
            }),
            prisma.followRequest.delete({
                where: { id: requestId }
            })
        ]);
    } else if (action === "REJECT") {
        // Sadece sil
        await prisma.followRequest.delete({
            where: { id: requestId }
        });
    }

    revalidatePath("/messages");
    revalidatePath(`/user/${request.senderId}`);
}

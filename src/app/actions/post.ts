"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        throw new Error("Giriş yapmalısınız!");
    }

    const content = (formData.get("content") as string) || "";
    const imageUrl = formData.get("imageUrl") as string | null;
    const videoUrl = formData.get("videoUrl") as string | null;

    if (content.trim().length === 0 && !imageUrl && !videoUrl) {
        throw new Error("Gönderi metni veya medyası olmalıdır.");
    }

    if (content.length > 500) {
        throw new Error("Gönderi 500 karakterden uzun olamaz.");
    }

    // Find user based on email (session contains email)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        throw new Error("Kullanıcı bulunamadı.");
    }

    // Create Post
    await prisma.post.create({
        data: {
            content: content.trim(),
            imageUrl: imageUrl || null,
            videoUrl: videoUrl || null,
            authorId: user.id,
        },
    });

    // Revalidate the feed page so new post shows up instantly
    revalidatePath("/feed");
}

export async function deletePost(postId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) return;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    // Check if post belongs to user
    if (post?.authorId === user.id) {
        await prisma.post.delete({ where: { id: postId } });
        revalidatePath("/feed");
    }
}

export async function editPost(postId: string, newContent: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) return;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return;

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (post?.authorId === user.id) {
        await prisma.post.update({
            where: { id: postId },
            data: { content: newContent.trim() }
        });
        revalidatePath("/feed");
    }
}

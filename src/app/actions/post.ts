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

    // Çoklu medya — mediaUrl_0, mediaUrl_1, ... ve mediaType_0, mediaType_1, ...
    const mediaItems: { url: string; type: string }[] = [];
    let i = 0;
    while (formData.get(`mediaUrl_${i}`)) {
        const url = formData.get(`mediaUrl_${i}`) as string;
        const type = (formData.get(`mediaType_${i}`) as string) || "IMAGE";
        mediaItems.push({ url, type });
        i++;
    }

    // Geriye dönük uyumluluk için eski alanlar da kontrol
    const legacyImageUrl = formData.get("imageUrl") as string | null;
    const legacyVideoUrl = formData.get("videoUrl") as string | null;
    if (legacyImageUrl && mediaItems.length === 0) mediaItems.push({ url: legacyImageUrl, type: "IMAGE" });
    if (legacyVideoUrl && mediaItems.length === 0) mediaItems.push({ url: legacyVideoUrl, type: "VIDEO" });

    if (content.trim().length === 0 && mediaItems.length === 0) {
        throw new Error("Gönderi metni veya medyası olmalıdır.");
    }

    if (content.length > 500) {
        throw new Error("Gönderi 500 karakterden uzun olamaz.");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        throw new Error("Kullanıcı bulunamadı.");
    }

    await prisma.post.create({
        data: {
            content: content.trim(),
            // Geriye dönük uyumluluk için ilk medyayı imageUrl/videoUrl'e de kaydet
            imageUrl: mediaItems.find(m => m.type === "IMAGE")?.url || null,
            videoUrl: mediaItems.find(m => m.type === "VIDEO")?.url || null,
            authorId: user.id,
            media: {
                create: mediaItems.map((m, idx) => ({
                    url: m.url,
                    type: m.type,
                    order: idx,
                }))
            }
        },
    });

    revalidatePath("/feed");
}

export async function deletePost(postId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) return;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return;

    const post = await prisma.post.findUnique({ where: { id: postId } });
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

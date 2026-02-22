"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function toggleLike(postId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId: user.id, postId } }
    });

    if (existingLike) {
        await prisma.like.delete({
            where: { id: existingLike.id }
        });
    } else {
        await prisma.like.create({
            data: { userId: user.id, postId }
        });
    }

    // Cache'i temizleyerek anlık gösterimini sağlıyoruz. Feed, Yazar ve Profil sayfaları için geçerli
    revalidatePath("/feed");
    revalidatePath("/profile");
}

export async function addComment(postId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    if (!content || content.trim() === "") return;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const newComment = await prisma.comment.create({
        data: {
            content: content.trim(),
            userId: user.id,
            postId
        },
        include: { user: { select: { name: true, image: true, id: true } } }
    });

    revalidatePath("/feed");
    revalidatePath("/profile");

    return newComment;
}

export async function toggleCommentLike(commentId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const existingLike = await prisma.commentLike.findUnique({
        where: { userId_commentId: { userId: user.id, commentId } }
    });

    if (existingLike) {
        await prisma.commentLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        await prisma.commentLike.create({
            data: { userId: user.id, commentId }
        });
    }

    revalidatePath("/feed");
    revalidatePath("/profile");
}

export async function editComment(commentId: string, newContent: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    if (!newContent || newContent.trim() === "") return;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== user.id) throw new Error("Yetkisiz işlem.");

    await prisma.comment.update({
        where: { id: commentId },
        data: { content: newContent.trim() }
    });

    revalidatePath("/feed");
    revalidatePath("/profile");
}

export async function deleteComment(commentId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız!");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== user.id) throw new Error("Yetkisiz işlem.");

    await prisma.comment.delete({
        where: { id: commentId }
    });

    revalidatePath("/feed");
    revalidatePath("/profile");
}

export async function getPostStats(postId: string) {
    noStore(); // Polling
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email ?
        (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id : null;

    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            likes: { select: { userId: true } },
            _count: { select: { likes: true } },
            comments: {
                select: {
                    id: true,
                    _count: { select: { likes: true } },
                    likes: { select: { userId: true } }
                }
            }
        }
    });

    if (!post) return null;

    return {
        likeCount: post._count.likes,
        hasLiked: userId ? post.likes.some(l => l.userId === userId) : false,
        comments: post.comments.map(c => ({
            id: c.id,
            likeCount: c._count.likes,
            hasLiked: userId ? c.likes.some(l => l.userId === userId) : false
        }))
    };
}

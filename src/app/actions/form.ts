"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Form Oluştur / Güncelle ─────────────────────────────────────────────────
export async function saveEventForm(
    eventId: string,
    fields: { label: string; type: string; options?: string; required: boolean; order: number }[]
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız.");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });
    if (!user || user.role !== "CLUB") throw new Error("Yetkiniz yok.");

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { authorId: true } });
    if (event?.authorId !== user.id) throw new Error("Bu etkinlik size ait değil.");

    // Mevcut form varsa güncelle, yoksa oluştur
    const form = await prisma.eventForm.upsert({
        where: { eventId },
        create: { eventId },
        update: {}
    });

    // Tüm mevcut alanları sil ve yeniden oluştur
    await prisma.formField.deleteMany({ where: { formId: form.id } });
    await prisma.formField.createMany({
        data: fields.map(f => ({
            formId: form.id,
            label: f.label,
            type: f.type,
            options: f.options || null,
            required: f.required,
            order: f.order
        }))
    });

    revalidatePath(`/events/${eventId}`);
    return { success: true };
}

// ─── Form Cevabı Gönder ───────────────────────────────────────────────────────
export async function submitFormResponse(
    formId: string,
    answers: Record<string, string | string[] | boolean>
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız.");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true }
    });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    // Daha önce kayıt yaptırdı mı?
    const existing = await prisma.formResponse.findFirst({
        where: { formId, userId: user.id }
    });
    if (existing) throw new Error("Bu etkinliğe zaten kayıt yaptırdınız.");

    await prisma.formResponse.create({
        data: {
            formId,
            userId: user.id,
            userName: user.name,
            answers: answers as object
        }
    });

    return { success: true };
}

// ─── Form Sil ───────────────────────────────────────────────────────────────
export async function deleteEventForm(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmalısınız.");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });
    if (!user || user.role !== "CLUB") throw new Error("Yetkiniz yok.");

    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { authorId: true } });
    if (event?.authorId !== user.id) throw new Error("Bu etkinlik size ait değil.");

    await prisma.eventForm.deleteMany({ where: { eventId } });
    revalidatePath(`/events/${eventId}`);
}

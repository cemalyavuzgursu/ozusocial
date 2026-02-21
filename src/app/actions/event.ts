"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUniversityFromEmail } from "@/lib/university";

export async function createEvent(formData: FormData, imageUrl?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmanız gerekiyor.");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (!user || user.role !== "CLUB") {
        throw new Error("Sadece Öğrenci Kulüpleri etkinlik oluşturabilir.");
    }

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const location = formData.get("location")?.toString();
    const startDateRaw = formData.get("startDate")?.toString();
    const endDateRaw = formData.get("endDate")?.toString();
    const price = formData.get("price")?.toString() || null;

    if (!title || !description || !location || !startDateRaw || !endDateRaw) {
        throw new Error("Lütfen tüm zorunlu alanları doldurun.");
    }

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);

    if (startDate >= endDate) {
        throw new Error("Bitiş zamanı başlangıçtan önce olamaz.");
    }

    const universityName = getUniversityFromEmail(session.user.email);

    try {
        await prisma.event.create({
            data: {
                title,
                description,
                location,
                startDate,
                endDate,
                price,
                imageUrl: imageUrl || null,
                university: universityName,
                authorId: user.id
            }
        });

        revalidatePath("/events");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Etkinlik oluşturulurken bir sorun oluştu.");
    }
}

export async function deleteEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Giriş yapmanız gerekiyor.");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { authorId: true }
    });

    if (!event) throw new Error("Etkinlik bulunamadı.");

    // Sadece etkinliği oluşturan kulüp silebilir
    if (event.authorId !== user.id) {
        throw new Error("Bu etkinliği silme yetkiniz yok.");
    }

    try {
        await prisma.event.delete({
            where: { id: eventId }
        });

        revalidatePath("/events");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Etkinlik silinirken bir sorun oluştu.");
    }
}

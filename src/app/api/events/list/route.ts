import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getUniversityFromEmail } from "@/lib/university";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json([], { status: 401 });

    const universityName = getUniversityFromEmail(session.user.email);

    // Son 7 gün + gelecekteki etkinlikler
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const events = await prisma.event.findMany({
        where: {
            endDate: { gte: sevenDaysAgo },
            OR: [
                { isUniversityOnly: false },
                { isUniversityOnly: true, university: universityName }
            ]
        },
        select: { id: true, title: true, imageUrl: true, startDate: true, location: true },
        orderBy: { startDate: "asc" },
        take: 30,
    });

    return NextResponse.json(events);
}

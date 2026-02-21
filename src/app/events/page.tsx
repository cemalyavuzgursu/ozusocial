import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUniversityFromEmail } from "@/lib/university";
import EventCard from "@/components/events/EventCard";
import CreateEventButton from "@/app/events/CreateEventButton";
import Navbar from "@/components/layout/Navbar";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, isOnboarded: true }
    });

    if (!user) redirect("/");
    if (!user.isOnboarded) redirect("/onboarding");

    // Kullanıcının okuluna bağlı etkinlikleri listeleme mantığı
    const universityName = getUniversityFromEmail(session.user.email);
    const events = await prisma.event.findMany({
        where: { university: universityName },
        include: {
            author: { select: { id: true, name: true, image: true, role: true } }
        },
        orderBy: { startDate: "asc" }
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6">
            <Navbar />

            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                            Etkinlikler
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            {universityName} ağındaki aktif kulüp etkinlikleri.
                        </p>
                    </div>
                    {user.role === "CLUB" && (
                        <CreateEventButton />
                    )}
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                            Henüz etkinlik yok!
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            {universityName} için planlanmış bir etkinlik bulunamadı.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {events.map((event: any) => (
                            <EventCard key={event.id} event={event} currentUserId={user.id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

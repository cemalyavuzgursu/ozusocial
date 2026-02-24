import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import ClubBadge from "@/components/ui/ClubBadge";
import { deleteEvent } from "@/app/actions/event";

export const dynamic = "force-dynamic";

export default async function EventDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: { author: { select: { id: true, name: true, image: true, role: true } } }
    });

    if (!event) notFound();

    const isOwner = currentUser?.id === event.authorId;
    const isPast = new Date() > new Date(event.endDate);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-16">
            <Navbar />
            <main className="max-w-2xl mx-auto pt-6">
                <Link href="/events" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-rose-500 transition-colors mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Etkinliklere Geri Dön
                </Link>

                <div className={`bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm ${isPast ? 'opacity-75' : ''}`}>
                    {/* Kapak Fotoğrafı */}
                    {event.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover" />
                    ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-rose-100 to-indigo-100 dark:from-rose-500/10 dark:to-indigo-500/10 flex items-center justify-center">
                            <svg className="w-12 h-12 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Başlık + Sil butonu */}
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                {isPast && (
                                    <span className="inline-block px-3 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-bold rounded-full mb-2">
                                        Süresi Geçti
                                    </span>
                                )}
                                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {event.title}
                                </h1>
                                <Link href={`/user/${event.author.id}`} className="inline-flex items-center gap-2 mt-3 group">
                                    {event.author.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={event.author.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center text-xs font-bold">
                                            {event.author.name?.charAt(0) || "K"}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-rose-500 transition-colors flex items-center gap-1.5">
                                        {event.author.name}
                                        {event.author.role === "CLUB" && <ClubBadge />}
                                    </span>
                                </Link>
                            </div>
                            {isOwner && (
                                <form action={async () => {
                                    "use server";
                                    await deleteEvent(event.id);
                                    redirect("/events");
                                }}>
                                    <button type="submit" className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Detaylar */}
                        <div className="grid sm:grid-cols-2 gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {format(new Date(event.startDate), "d MMMM yyyy", { locale: tr })}
                                    </p>
                                    <p className="text-xs">
                                        {format(new Date(event.startDate), "HH:mm")} – {format(new Date(event.endDate), "HH:mm")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{event.location}</p>
                            </div>
                            {event.price && (
                                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300 sm:col-span-2">
                                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{event.price}</p>
                                </div>
                            )}
                        </div>

                        {/* Açıklama */}
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Açıklama</h2>
                            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

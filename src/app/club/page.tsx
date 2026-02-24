/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import CreateEventButton from "@/app/events/CreateEventButton";
import { deleteEvent } from "@/app/actions/event";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function ClubPanelPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, name: true, image: true, _count: { select: { followedBy: true } } }
    });

    if (!user || user.role !== "CLUB") redirect("/feed");

    const events = await prisma.event.findMany({
        where: { authorId: user.id },
        orderBy: { startDate: "desc" },
        include: {
            form: {
                include: {
                    _count: { select: { responses: true } }
                }
            }
        }
    });

    const totalResponses = events.reduce((sum, e) => sum + (e.form?._count?.responses || 0), 0);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-16">
            <Navbar />
            <main className="max-w-3xl mx-auto pt-4 space-y-8">
                {/* Header */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.image} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center text-2xl font-bold">
                                {user.name?.charAt(0) || "K"}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{user.name}</h1>
                            <p className="text-sm text-neutral-500">Kulüp Yönetim Paneli</p>
                        </div>
                    </div>

                    {/* İstatistikler */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Takipçi", value: user._count.followedBy },
                            { label: "Etkinlik", value: events.length },
                            { label: "Toplam Kayıt", value: totalResponses },
                        ].map(stat => (
                            <div key={stat.label} className="text-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800">
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Etkinlikler */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Etkinliklerim</h2>
                        <CreateEventButton />
                    </div>

                    {events.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-500">
                            <p>Henüz etkinlik oluşturmadınız.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event: any) => (
                                <div key={event.id} className="bg-white dark:bg-neutral-900 rounded-2xl px-5 py-4 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-neutral-900 dark:text-white truncate">{event.title}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {format(new Date(event.startDate), "d MMMM yyyy", { locale: tr })}
                                            {event.form && (
                                                <span className="ml-2 text-rose-500 font-semibold">
                                                    · {event.form._count.responses} kayıt
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link
                                            href={`/club/events/${event.id}/form`}
                                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"
                                        >
                                            {event.form ? "Formu Düzenle" : "Form Ekle"}
                                        </Link>
                                        {event.form && (
                                            <Link
                                                href={`/club/events/${event.id}/responses`}
                                                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors"
                                            >
                                                Cevaplar
                                            </Link>
                                        )}
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                            title="Etkinlik Sayfası"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </Link>
                                        <form action={async () => {
                                            "use server";
                                            await deleteEvent(event.id);
                                        }}>
                                            <button
                                                type="submit"
                                                className="p-1.5 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                title="Sil"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

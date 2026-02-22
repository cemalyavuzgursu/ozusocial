import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, isOnboarded: true, isBanned: true }
    });

    if (!user) redirect("/");
    if (user.isBanned) redirect("/auth/error?error=Banned");
    if (!user.isOnboarded) redirect("/onboarding");

    const tickets = await prisma.supportTicket.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Açık</span>;
            case "RESOLVED":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Çözüldü</span>;
            case "CLOSED":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">Kapalı</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6 pb-20">
            <Navbar />

            <div className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Destek Taleplerim</h1>
                        <p className="text-sm text-neutral-500 mt-1">Soru, sorun ve önerileriniz için bizimle iletişime geçin.</p>
                    </div>
                    <Link
                        href="/support/new"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shrink-0 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Yeni Talep Oluştur
                    </Link>
                </div>

                {tickets.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Henüz destek talebiniz yok</h3>
                        <p className="text-neutral-500 text-sm max-w-sm mx-auto">Bir problem yaşıyorsanız veya öneriniz varsa hemen yeni bir talep oluşturabilirsiniz.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tickets.map((ticket) => (
                            <Link href={`/support/${ticket.id}`} key={ticket.id} className="block group">
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-900/50 transition-all">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1 flex-1">
                                            {ticket.category}
                                        </h3>
                                        <div className="shrink-0">{getStatusBadge(ticket.status)}</div>
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                                        {ticket.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Son Güncelleme: {format(new Date(ticket.updatedAt), "d MMM yyyy, HH:mm", { locale: tr })}
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Detayları Gör
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

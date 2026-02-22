import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import TicketMessageForm from "@/components/support/TicketMessageForm";
import SupportChatInterface from "@/components/support/SupportChatInterface";

export const dynamic = "force-dynamic";

export default async function SupportTicketDetailPage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) redirect("/");

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: params.id },
        include: {
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!ticket) redirect("/support");
    if (ticket.userId !== user.id) redirect("/support"); // Yetki kontrolü

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Açık</span>;
            case "RESOLVED":
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Çözüldü</span>;
            case "CLOSED":
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">Kapalı</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6 pb-20">
            <Navbar />

            <div className="max-w-3xl mx-auto mt-8 flex flex-col h-[calc(100vh-140px)]">

                {/* Header */}
                <div className="shrink-0 mb-6 flex flex-col gap-4">
                    <Link
                        href="/support"
                        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors self-start"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Taleplerime Dön
                    </Link>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex-1">
                                {ticket.category}
                            </h1>
                            <div className="shrink-0">{getStatusBadge(ticket.status)}</div>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm whitespace-pre-wrap leading-relaxed">
                            {ticket.description}
                        </p>
                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
                            <span>Oluşturulma: {format(new Date(ticket.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}</span>
                            <span className="font-mono">ID: #{ticket.id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Messages Chat Area */}
                <div className="flex-1 bg-neutral-100 dark:bg-neutral-800/20 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col h-0">

                    <div className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                        <h2 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            Mesajlar
                            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full text-xs">{ticket.messages.length}</span>
                        </h2>
                    </div>

                    <SupportChatInterface
                        ticketId={ticket.id}
                        initialMessages={ticket.messages}
                        isAdmin={false}
                    />
                </div>

                {/* Message Input */}
                {ticket.status !== "CLOSED" ? (
                    <TicketMessageForm ticketId={ticket.id} isAdmin={false} />
                ) : (
                    <div className="mt-4 p-4 text-center bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 rounded-2xl text-sm font-medium border border-neutral-200 dark:border-neutral-800">
                        Bu talep kapatıldığı için yeni mesaj gönderilemez.
                    </div>
                )}

            </div>
        </div>
    );
}

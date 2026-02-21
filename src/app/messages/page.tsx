/* eslint-disable @next/next/no-img-element */
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import NewMessageModal from "@/components/messages/NewMessageModal";
import FollowRequestItem from "@/components/messages/FollowRequestItem";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            receivedFollowRequests: {
                orderBy: { createdAt: "desc" },
                include: {
                    sender: { select: { id: true, name: true, image: true, role: true } }
                }
            }
        }
    });

    if (!user) redirect("/");
    if (user.isBanned) redirect("/auth/error?error=Banned");
    if (!user.isOnboarded) redirect("/onboarding");

    // Sohbetleri son aktiviteye göre sırala
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: { some: { id: user.id } }
        },
        include: {
            participants: {
                where: { id: { not: user.id } },
                select: { id: true, name: true, image: true, role: true }
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: { updatedAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">
            <Navbar />

            <main className="max-w-3xl mx-auto flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <h1 className="text-2xl font-bold">Mesajlar</h1>
                    <NewMessageModal />
                </div>

                {user.receivedFollowRequests && user.receivedFollowRequests.length > 0 && (
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Takip İstekleri <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">{user.receivedFollowRequests.length}</span>
                        </h2>
                        <div className="flex flex-col gap-3">
                            {user.receivedFollowRequests.map(req => (
                                <FollowRequestItem key={req.id} request={req} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    {conversations.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500">
                            <svg className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-lg font-medium">Hiç mesajın yok.</p>
                            <p className="text-sm mt-1">Takip ettiğin kişilere veya kulüplere yazarak sohbete başla.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {conversations.map(conv => {
                                const target = conv.participants[0];
                                const lastMessage = conv.messages[0];

                                return (
                                    <Link key={conv.id} href={`/messages/${conv.id}`} className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0">
                                            {target?.image ? (
                                                <img src={target.image} alt={target.name || "Kullanıcı"} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-lg">
                                                    {target?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white truncate pr-2 flex items-center gap-1.5">
                                                    {target?.name}
                                                    {target?.role === "CLUB" && (
                                                        <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.25 rounded-full font-bold ml-1">KULÜP</span>
                                                    )}
                                                </h3>
                                                {lastMessage && (
                                                    <span className="text-xs text-neutral-400 shrink-0">
                                                        {formatDistanceToNow(lastMessage.createdAt, { addSuffix: true, locale: tr })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${lastMessage && !lastMessage.isRead && lastMessage.senderId !== user.id ? "text-neutral-900 dark:text-white font-medium" : "text-neutral-500"}`}>
                                                {lastMessage ? (
                                                    <>
                                                        {lastMessage.senderId === user.id && <span className="mr-1">Sen:</span>}
                                                        {lastMessage.content}
                                                    </>
                                                ) : (
                                                    <span className="italic text-neutral-400">Henüz mesaj yok</span>
                                                )}
                                            </p>
                                        </div>
                                        {lastMessage && !lastMessage.isRead && lastMessage.senderId !== user.id && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

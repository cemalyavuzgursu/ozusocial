import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ChatInterface from "@/components/messages/ChatInterface";

export const dynamic = "force-dynamic";

export default async function ConversationPage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) redirect("/");

    const conversation = await prisma.conversation.findUnique({
        where: { id: params.id },
        include: {
            participants: {
                where: { id: { not: user.id } },
                select: { id: true, name: true, image: true, role: true }
            },
            messages: {
                orderBy: { createdAt: "asc" },
                include: { sender: { select: { id: true, name: true, image: true } } }
            }
        }
    });

    if (!conversation) {
        redirect("/messages");
    }

    const targetUser = conversation.participants[0];

    // Mesajları okundu olarak işaretle
    const unreadMessagesCount = await prisma.message.count({
        where: { conversationId: conversation.id, isRead: false, senderId: { not: user.id } }
    });

    if (unreadMessagesCount > 0) {
        await prisma.message.updateMany({
            where: { conversationId: conversation.id, isRead: false, senderId: { not: user.id } },
            data: { isRead: true }
        });
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/messages" className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>

                    <Link href={`/user/${targetUser.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 group-hover:ring-2 ring-rose-500 transition-all">
                            {targetUser?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={targetUser.image} alt={targetUser.name || ""} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                                    {targetUser?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold text-[15px] text-neutral-900 dark:text-white leading-tight flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                                {targetUser?.name}
                                {targetUser?.role === "CLUB" && (
                                    <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723..." clipRule="evenodd" />
                                    </svg>
                                )}
                            </h2>
                            <p className="text-xs text-neutral-500 font-medium">@{targetUser?.name?.toLowerCase().replace(/\s/g, "")}</p>
                        </div>
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto pt-20 pb-[76px] px-4 flex flex-col justify-end">
                <ChatInterface
                    initialMessages={conversation.messages}
                    currentUserId={user.id}
                    conversationId={conversation.id}
                />
            </main>
        </div>
    );
}

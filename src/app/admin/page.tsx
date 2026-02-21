import { getAdminSession } from "@/lib/auth";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { approveRequest, rejectRequest } from "@/app/actions/admin";
import UserSearch from "@/components/admin/UserSearch";
import CreateUserForm from "@/components/admin/CreateUserForm";
import TicketManager from "@/components/admin/TicketManager";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const adminSession = await getAdminSession();

    // Güvenlik doğrulamasını middleware yapıyor ama yine de kontrol ekliyoruz:
    if (!adminSession?.username) {
        redirect("/admin/login");
    }

    // Bekleyen tüm başvuruları getir
    const pendingRequests = await prisma.roleRequest.findMany({
        where: { status: "PENDING" },
        include: {
            user: { select: { id: true, name: true, email: true, image: true, role: true } }
        },
        orderBy: { createdAt: "asc" }
    });

    // Destek Taleplerini (Tickets) getir
    const allTickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true } }
        }
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
            <header className="max-w-5xl mx-auto flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-inner">
                        A
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">ÖzüSocial Admin</h1>
                        <p className="text-xs text-neutral-400">Yönetim Paneli - {pendingRequests.length} Bekleyen İstek</p>
                    </div>
                </div>

                <form action={logoutAdmin}>
                    <button type="submit" className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-sm font-semibold transition-colors border border-rose-500/20">
                        Çıkış Yap
                    </button>
                </form>
            </header>

            <main className="max-w-5xl mx-auto flex flex-col gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Kulüp Hesabı Başvuruları
                        </h2>
                    </div>

                    {pendingRequests.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500 bg-neutral-900/20">
                            <p className="text-lg">Şu anda bekleyen yeni başvuru yok.</p>
                            <p className="text-sm mt-1">Öğrencilerin yaptığı başvurular buraya düşecektir.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-800">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {pendingRequests.map((req: any) => (
                                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-800/20 transition-colors">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 mt-1 flex-shrink-0">
                                            {req.user.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={req.user.image} alt={req.user.name || "Kullanıcı"} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                                                    {req.user.name?.charAt(0) || req.user.email?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">{req.user.name || "İsimsiz"}</h3>
                                                <span className="text-xs text-neutral-500 font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 drop-shadow-sm">
                                                    {req.user.email}
                                                </span>
                                            </div>

                                            <div className="mt-3 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/80">
                                                <p className="text-sm text-neutral-400 font-medium mb-1">Başvuru Notu:</p>
                                                <p className="text-sm text-neutral-300 italic">&quot;{req.message}&quot;</p>
                                            </div>

                                            <p className="text-xs text-neutral-600 mt-3 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatDistanceToNow(req.createdAt, { addSuffix: true, locale: tr })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto border-t md:border-none border-neutral-800 pt-4 md:pt-0 w-full md:w-auto mt-2 md:mt-0">
                                        <Link
                                            href={`/user/${req.user.id}`}
                                            target="_blank"
                                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold transition-colors flex-1 md:flex-none text-center border border-neutral-700"
                                        >
                                            Profili İncele
                                        </Link>
                                        <form action={rejectRequest.bind(null, req.id)} className="flex-1 md:flex-none">
                                            <button type="submit" className="w-full px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-sm font-semibold transition-colors border border-rose-500/20">
                                                Reddet
                                            </button>
                                        </form>
                                        <form action={approveRequest.bind(null, req.id, req.user.id)} className="flex-1 md:flex-none">
                                            <button type="submit" className="w-full px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg text-sm font-semibold shadow-lg hover:shadow-green-500/20 transition-all border border-green-600">
                                                Onayla
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <CreateUserForm />

                <TicketManager initialTickets={allTickets as any} />

                <UserSearch />
            </main>
        </div>
    );
}

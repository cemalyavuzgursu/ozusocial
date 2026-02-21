"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { updateTicketStatus, deleteTicket } from "@/app/actions/help";

type Ticket = {
    id: string;
    category: string;
    description: string;
    mediaUrl: string | null;
    status: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
};

export default function TicketManager({ initialTickets }: { initialTickets: Ticket[] }) {
    const [tickets, setTickets] = useState(initialTickets);
    const [filter, setFilter] = useState("ALL");

    const filteredTickets = tickets.filter(t => filter === "ALL" ? true : t.status === filter);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateTicketStatus(id, newStatus);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Status update error", error);
            alert("Durum güncellenirken bir hata oluştu.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu destek talebini tamamen silmek istediğinize emin misiniz?")) return;

        try {
            await deleteTicket(id);
            setTickets(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Delete error", error);
            alert("Silme işlemi başarısız oldu.");
        }
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl mt-6">
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Destek Talepleri (Tickets)
                    <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded-full ml-2">
                        {tickets.length}
                    </span>
                </h2>

                <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 shrink-0">
                    <button onClick={() => setFilter("ALL")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "ALL" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>Tümü</button>
                    <button onClick={() => setFilter("OPEN")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "OPEN" ? "bg-neutral-800 text-amber-400" : "text-neutral-500 hover:text-amber-500/50"}`}>Açık</button>
                    <button onClick={() => setFilter("RESOLVED")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "RESOLVED" ? "bg-neutral-800 text-green-400" : "text-neutral-500 hover:text-green-500/50"}`}>Çözüldü</button>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 bg-neutral-900/20">
                    <p className="text-lg">Gösterilecek destek talebi bulunamadı.</p>
                </div>
            ) : (
                <div className="divide-y divide-neutral-800">
                    {filteredTickets.map(ticket => (
                        <div key={ticket.id} className="p-6 flex flex-col hover:bg-neutral-800/20 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${ticket.category === 'Öneri' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ticket.category === 'Şikayet' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                            {ticket.category}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                            {ticket.status === 'OPEN' ? 'Açık' : 'Çözüldü'}
                                        </span>
                                        <span className="text-xs text-neutral-500 flex items-center gap-1 ml-2">
                                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: tr })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-semibold text-neutral-200">{ticket.user.name || "İsimsiz"}</span>
                                        <span className="text-xs text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                                            {ticket.user.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/user/${ticket.user.id}`} target="_blank" className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors border border-neutral-700">Profil</Link>
                                    {ticket.status === 'OPEN' ? (
                                        <button onClick={() => handleStatusChange(ticket.id, 'RESOLVED')} className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-green-500/20">Çözüldü İşaretle</button>
                                    ) : (
                                        <button onClick={() => handleStatusChange(ticket.id, 'OPEN')} className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-amber-500/20">Açık İşaretle</button>
                                    )}
                                    <button onClick={() => handleDelete(ticket.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-rose-500/20">Sil</button>
                                </div>
                            </div>

                            <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 mt-2">
                                <p className="text-sm text-neutral-300 whitespace-pre-wrap">{ticket.description}</p>
                                {ticket.mediaUrl && (
                                    <div className="mt-4 pt-4 border-t border-neutral-800/50">
                                        <a href={ticket.mediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            Ekli Medyayı Görüntüle
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

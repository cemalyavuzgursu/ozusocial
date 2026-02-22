"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { sendSupportMessage, getSupportMessages } from "@/app/actions/support";
import TicketMessageForm from "./TicketMessageForm";

export default function SupportChatInterface({ ticketId, initialMessages, isAdmin = false }: any) {
    const [messages, setMessages] = useState(initialMessages);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic 
    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling logic
    const fetchMessages = useCallback(async () => {
        try {
            const latestMessages = await getSupportMessages(ticketId);
            setMessages(latestMessages);
        } catch (error) {
            console.error("Mesajlar çekilirken hata:", error);
        }
    }, [ticketId]);

    useEffect(() => {
        const intervalId = setInterval(fetchMessages, 3000); // 3 saniyede bir kontrol et
        return () => clearInterval(intervalId); // Component unmount olduğunda temizle
    }, [fetchMessages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-neutral-500 text-sm">
                    Henüz yeni bir mesaj yok. Detay eklemek isterseniz aşağıdan yazabilirsiniz.
                </div>
            ) : (
                messages.map((msg: any) => {
                    const isUser = !msg.isAdmin;
                    return (
                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 ${isUser
                                ? 'bg-rose-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-bl-none shadow-sm'
                                }`}>
                                {!isUser && (
                                    <div className="flex items-center gap-1.5 mb-1.5 text-rose-600 dark:text-rose-500">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        <span className="text-xs font-bold uppercase tracking-wider">Destek Ekibi</span>
                                    </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap font-medium">{msg.content}</p>
                                <div className={`text-[10px] sm:text-xs mt-2 text-right ${isUser ? 'text-rose-200' : 'text-neutral-400'}`}>
                                    {format(new Date(msg.createdAt), "HH:mm")}
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={bottomRef} className="h-2" />
        </div>
    );
}

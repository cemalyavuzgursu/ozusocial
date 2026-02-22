/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage, getMessages } from "@/app/actions/message";
import { format } from "date-fns";

export default function ChatInterface({ initialMessages, currentUserId, conversationId }: any) {
    const [messages, setMessages] = useState(initialMessages);
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        // Sadece yeni mesaj geldiğinde veya ilk yüklemede kaydır
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Polling logic
    const fetchMessages = useCallback(async () => {
        try {
            const latestMessages = await getMessages(conversationId);
            // Sadece server'dan gelen mesajları kaydet. Eğer kullanıcının henüz gönderilmemiş (optimistic) mesajı varsa, 
            // sunucudan geleni aldığında optimistic olan zaten sunucuda var olacağından üzerine yazılır.
            setMessages((prev: any) => {
                // Optimistic mesajları bul (id'si temp- ile başlayanlar)
                const optimisticMessages = prev.filter((m: any) => m.isOptimistic);

                // Server'dan gelen mesajların ID'lerini bir Set'e al
                const serverMessageIds = new Set(latestMessages.map((m: any) => m.id));

                // Hala server'a gitmemiş gibi görünen optimistic mesajları tut
                // (Eğer server'dan aynı content ve yakın tarihte bir mesaj geldiyse optimistic olanı silebiliriz ama basitlik için ID kontrolü yapıyoruz)
                // Daha iyi bir UX için, server'dan veri gelince tüm optimisticleri ezip yerine gerçek veriyi koyuyoruz.

                // En temiz yaklaşım: Eğer isSending true ise optimistic mesajları koru, değilse sadece server verisini kullan.
                if (isSending) {
                    return [...latestMessages, ...optimisticMessages];
                }
                return latestMessages;
            });
        } catch (error) {
            console.error("Mesajlar çekilirken hata:", error);
        }
    }, [conversationId, isSending]);

    useEffect(() => {
        const intervalId = setInterval(fetchMessages, 3000); // 3 saniyede bir kontrol et

        return () => clearInterval(intervalId); // Component unmount olduğunda temizle
    }, [fetchMessages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: content.trim(),
            senderId: currentUserId,
            createdAt: new Date(),
            sender: { id: currentUserId },
            isOptimistic: true
        };

        setMessages((prev: any) => [...prev, optimisticMessage]);
        setContent("");
        setIsSending(true);

        await sendMessage(conversationId, optimisticMessage.content);
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full justify-end relative z-0">
            <div className="flex flex-col gap-4 mb-4">
                {messages.length === 0 && (
                    <div className="text-center text-neutral-500 py-10">
                        <p>Henüz mesaj yok. Bir şeyler yaz!</p>
                    </div>
                )}
                {messages.map((msg: any) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] ${isMe
                                ? 'bg-rose-600 text-white rounded-tr-sm shadow-md'
                                : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-sm border border-neutral-100 dark:border-neutral-700 shadow-sm'
                                } ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1.5 flex items-center justify-end font-medium ${isMe ? 'text-rose-200' : 'text-neutral-400'}`}>
                                    {format(new Date(msg.createdAt), "HH:mm")}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} className="h-2" />
            </div>

            <form onSubmit={handleSend} className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4 z-40">
                <div className="max-w-3xl mx-auto flex gap-3 w-full">
                    <input
                        type="text"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Bir mesaj yaz..."
                        className="flex-1 rounded-full bg-neutral-100 dark:bg-neutral-900 px-5 py-3 ml-2 sm:ml-0 text-[15px] outline-none focus:ring-2 focus:ring-rose-500/50 border border-transparent focus:bg-white dark:focus:bg-neutral-950 shadow-inner transition-all dark:text-white"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !content.trim()}
                        className="w-12 h-12 shrink-0 bg-rose-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-700 transition-colors shadow-md"
                    >
                        <svg className="w-5 h-5 -ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}

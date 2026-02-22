/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage, getMessages } from "@/app/actions/message";
import { format } from "date-fns";

export default function ChatInterface({ initialMessages, currentUserId, conversationId }: any) {
    const [messages, setMessages] = useState(initialMessages);
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string, type: string, name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic (scroll to bottom when new messages arrive)
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
            const latestMessages = await getMessages(conversationId);

            setMessages((prev: any) => {
                // Keep optimistic messages that haven't been confirmed by server yet
                const optimisticMessages = prev.filter((m: any) => m.isOptimistic);

                if (isSending) {
                    return [...latestMessages, ...optimisticMessages];
                }

                // if not sending, just use server truth
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolü (örn: 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("Dosya boyutu çok büyük. Lütfen 10MB'dan küçük bir dosya seçin.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Yükleme başarısız");

            const data = await res.json();
            setAttachment({
                url: data.url,
                type: file.type,
                name: file.name
            });
        } catch (error) {
            console.error("Upload error", error);
            alert("Dosya yüklenirken bir hata oluştu.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && !attachment) || isSending || isUploading) return;

        const optContent = content.trim();
        const optAttachment = attachment;

        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: optContent,
            senderId: currentUserId,
            createdAt: new Date(),
            sender: { id: currentUserId },
            isOptimistic: true,
            fileUrl: optAttachment?.url,
            fileType: optAttachment?.type
        };

        setMessages((prev: any) => [...prev, optimisticMessage]);
        setContent("");
        setAttachment(null);
        setIsSending(true);

        try {
            await sendMessage(conversationId, optContent, optAttachment?.url, optAttachment?.type);
        } catch (error) {
            console.error(error);
            // İstenirse hata yönetimi eklenebilir
        } finally {
            setIsSending(false);
        }
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
                                {msg.fileUrl && msg.fileType?.startsWith('image/') && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={msg.fileUrl} alt="Eklenti" className="max-w-full h-auto rounded-lg mb-2 max-h-60 object-cover" />
                                )}
                                {msg.fileUrl && !msg.fileType?.startsWith('image/') && (
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${isMe ? 'bg-rose-500 hover:bg-rose-400' : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'} transition-colors`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span className="text-sm font-medium underline underline-offset-2">Dosyayı İndir / Görüntüle</span>
                                    </a>
                                )}
                                {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
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
                <div className="max-w-3xl mx-auto flex flex-col gap-2 w-full relative">
                    {attachment && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-neutral-800 p-2 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                            {attachment.type.startsWith('image/') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={attachment.url} alt="Önizleme" className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{attachment.name}</p>
                                <p className="text-xs text-neutral-500">Ek eklendi</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAttachment(null)}
                                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-neutral-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 w-full items-center">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isSending}
                            className="p-3 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50"
                        >
                            {isUploading ? (
                                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            )}
                        </button>

                        <input
                            type="text"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Bir mesaj yaz..."
                            className="flex-1 rounded-full bg-neutral-100 dark:bg-neutral-900 px-5 py-3 text-[15px] outline-none focus:ring-2 focus:ring-rose-500/50 border border-transparent focus:bg-white dark:focus:bg-neutral-950 shadow-inner transition-all dark:text-white"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isSending || (!content.trim() && !attachment) || isUploading}
                            className="w-12 h-12 shrink-0 bg-rose-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-700 transition-colors shadow-md"
                        >
                            <svg className="w-5 h-5 -ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

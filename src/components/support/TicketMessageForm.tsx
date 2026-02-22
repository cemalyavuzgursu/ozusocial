"use client";

import { useState } from "react";
import { sendSupportMessage } from "@/app/actions/support";

export default function TicketMessageForm({ ticketId, isAdmin = false }: { ticketId: string, isAdmin?: boolean }) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError("");

        try {
            const res = await sendSupportMessage(ticketId, content, isAdmin);
            if (res.success) {
                setContent("");
                // Sayfa action ile revalidate ediliyor, yeni mesajlar görünecek
            }
        } catch (err: any) {
            setError(err.message || "Mesaj gönderilemedi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-4 py-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none text-sm text-neutral-900 dark:text-neutral-100"
                    disabled={isSubmitting}
                />

                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    )}
                    <span className="sm:hidden lg:inline">Gönder</span>
                </button>
            </div>
        </form>
    );
}

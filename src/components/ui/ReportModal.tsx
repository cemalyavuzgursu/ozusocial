"use client";

import { useState } from "react";
import { createReport } from "@/app/actions/report";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: "POST" | "COMMENT" | "USER";
    targetId: string;
}

export default function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!reason.trim()) {
            setError("Lütfen bir neden belirtin.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createReport(targetType, targetId, reason);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason("");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Rapor gönderilirken bir hata oluştu.");
            setIsSubmitting(false);
        }
    };

    const targetLabel = targetType === "POST" ? "Gönderiyi" : targetType === "COMMENT" ? "Yorumu" : "Kullanıcıyı";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 scale-in-center">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-rose-600 dark:text-rose-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {targetLabel} Raporla
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {success ? (
                    <div className="py-8 text-center flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="font-bold text-neutral-900 dark:text-white">Raporunuz alındı.</p>
                        <p className="text-sm text-neutral-500">İnceleme sürecinden sonra gerekli işlemler yapılacaktır.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && <p className="text-sm text-rose-500 font-medium p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl">{error}</p>}

                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                Bu içeriğin neden topluluk kurallarını ihlal ettiğini düşünüyorsunuz?
                            </p>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Lütfen ihlal nedenini açıklayın (spam, hakaret, nefret söylemi vb.)..."
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm resize-none"
                            />
                            <div className="text-right text-xs text-neutral-400 mt-1">{reason.length}/500</div>
                        </div>

                        <div className="flex gap-3 justify-end mt-2">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">İptal</button>
                            <button type="submit" disabled={isSubmitting || !reason.trim()} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                                Raporla
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

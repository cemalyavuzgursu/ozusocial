"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { createSupportTicket } from "@/app/actions/help";
import { useRouter } from "next/navigation";

export default function HelpPage() {
    const router = useRouter();
    const [category, setCategory] = useState("Öneri");
    const [description, setDescription] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setMessage({ type: 'error', text: 'Lütfen bir açıklama girin.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            let mediaUrl = "";
            if (mediaFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("file", mediaFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Dosya yüklenemedi.");
                const uploadData = await uploadRes.json();
                mediaUrl = uploadData.url;
                setIsUploading(false);
            }

            await createSupportTicket({
                category,
                description,
                mediaUrl
            });

            setMessage({ type: 'success', text: 'Talebiniz başarıyla alındı. Teşekkür ederiz!' });
            setDescription("");
            setMediaFile(null);

            setTimeout(() => {
                router.push("/feed");
            }, 3000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Bir hata oluştu.' });
            setIsUploading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">
            <Navbar />
            <main className="max-w-2xl mx-auto mt-8">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="mb-8 items-center flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Yardım ve Destek Merkezi</h1>
                            <p className="text-neutral-500 text-sm font-medium">Özellikle karşılaştığınız bir sorunu bildirebilir, bir tavsiyede bulunabilir veya şikayetinizi yönetime iletebilirsiniz.</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Talep Türü</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {["Öneri", "Şikayet", "Teknik Destek"].map((cat) => (
                                    <label key={cat} className={`flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-colors ${category === cat ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400' : 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}>
                                        <input type="radio" className="sr-only" name="category" value={cat} checked={category === cat} onChange={(e) => setCategory(e.target.value)} />
                                        <span className="text-sm font-medium">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Açıklama</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                placeholder="Lütfen detayları buraya yazın..."
                                className="w-full bg-neutral-100 dark:bg-neutral-950 border border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-rose-300 dark:focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Görsel veya Video (Opsiyonel)</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center justify-center w-full sm:w-auto px-6 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 transition-colors">
                                    <span className="text-sm text-neutral-500 font-medium">{mediaFile ? mediaFile.name : "Bir dosya seçin..."}</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setMediaFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                                {mediaFile && (
                                    <button type="button" onClick={() => setMediaFile(null)} className="text-sm text-rose-500 font-medium hover:underline">
                                        İptal
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className={`w-full py-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${(isSubmitting || isUploading) ? "opacity-70 pointer-events-none" : ""}`}
                        >
                            {isUploading ? "Dosya Yükleniyor..." : isSubmitting ? "Gönderiliyor..." : "Talebi Gönder"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

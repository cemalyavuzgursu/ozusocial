"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createSupportTicket } from "@/app/actions/support";

const CATEGORIES = ["Teknik Destek", "Şikayet", "Öneri", "Kullanıcı İşlemleri", "Diğer"];

export default function NewSupportTicket() {
    const router = useRouter();
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!description.trim()) {
            setError("Lütfen detaylı bir açıklama giriniz.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createSupportTicket(category, description);
            if (res.success) {
                router.push(`/support/${res.ticketId}`);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6 pb-20">
            <Navbar />

            <div className="max-w-xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Geri Dön
                    </button>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Yeni Destek Talebi</h1>
                    <p className="text-sm text-neutral-500 mt-1">Lütfen sorununuzu veya önerinizi detaylıca açıklayın.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-6">

                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold border border-rose-200 dark:border-rose-900/30">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 outline-none transition-all text-neutral-900 dark:text-white"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex justify-between">
                            Açıklama
                            <span className="text-neutral-400 font-normal">{description.length}/1000</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1000}
                            rows={6}
                            placeholder="Yaşadığınız problemi detaylıca anlatın..."
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 outline-none transition-all text-neutral-900 dark:text-white resize-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !description.trim()}
                        className="w-full py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Gönderiliyor</>
                        ) : "Talebi Gönder"}
                    </button>
                </form>
            </div>
        </div>
    );
}

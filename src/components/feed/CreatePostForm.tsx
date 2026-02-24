/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

"use client";

import { useState, useRef, useEffect } from "react";
import { createPost } from "@/app/actions/post";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface PreviewItem {
    file: File;
    preview: string;
    type: "IMAGE" | "VIDEO";
}

interface EventOption {
    id: string;
    title: string;
    imageUrl: string | null;
    startDate: Date;
    location: string;
}

export default function CreatePostForm({ userProfileImage }: { userProfileImage?: string | null }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mediaItems, setMediaItems] = useState<PreviewItem[]>([]);
    const [content, setContent] = useState("");
    const [linkedEvent, setLinkedEvent] = useState<EventOption | null>(null);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [events, setEvents] = useState<EventOption[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const fetchEvents = async () => {
        if (events.length > 0) return; // Zaten yüklendi
        setEventsLoading(true);
        try {
            const res = await fetch("/api/events/list");
            if (res.ok) setEvents(await res.json());
        } catch { }
        finally { setEventsLoading(false); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const remaining = 10 - mediaItems.length;
        const toAdd = files.slice(0, remaining);
        const newItems: PreviewItem[] = toAdd.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        }));
        setMediaItems(prev => [...prev, ...newItems]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemove = (index: number) => {
        setMediaItems(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            for (let i = 0; i < mediaItems.length; i++) {
                const item = mediaItems[i];
                const uploadData = new FormData();
                uploadData.append("file", item.file);
                uploadData.append("type", "post-media");
                const res = await fetch("/api/upload", { method: "POST", body: uploadData });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Medya yüklenemedi.");
                }
                const data = await res.json();
                formData.append(`mediaUrl_${i}`, data.url);
                formData.append(`mediaType_${i}`, item.type);
            }

            if (linkedEvent) formData.append("linkedEventId", linkedEvent.id);

            await createPost(formData);

            formRef.current?.reset();
            setContent("");
            mediaItems.forEach(m => URL.revokeObjectURL(m.preview));
            setMediaItems([]);
            setLinkedEvent(null);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm mb-8 transition-shadow hover:shadow-md">
            <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden ring-2 ring-white dark:ring-neutral-900">
                        {userProfileImage ? (
                            <img src={userProfileImage} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <textarea
                            name="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Kampüste neler oluyor? Paylaş!"
                            className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 text-lg resize-none outline-none border-b border-transparent focus:border-rose-500 transition-colors focus:ring-0 min-h-[60px]"
                            maxLength={500}
                        />

                        {/* Medya önizleme grid */}
                        {mediaItems.length > 0 && (
                            <div className={`mt-3 grid gap-2 ${mediaItems.length === 1 ? 'grid-cols-1' : mediaItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {mediaItems.map((item, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black/5 aspect-square group/item">
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(idx)}
                                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        {item.type === "VIDEO" ? (
                                            <video src={item.preview} className="w-full h-full object-cover" playsInline muted />
                                        ) : (
                                            <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                        )}
                                        {item.type === "VIDEO" && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black/50 rounded-full p-2">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bağlı etkinlik önizleme */}
                        {linkedEvent && (
                            <div className="mt-3 flex items-center gap-3 p-3 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                    {linkedEvent.imageUrl ? (
                                        <img src={linkedEvent.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 truncate">{linkedEvent.title}</p>
                                    <p className="text-xs text-indigo-500">{format(new Date(linkedEvent.startDate), "d MMM", { locale: tr })}</p>
                                </div>
                                <button type="button" onClick={() => setLinkedEvent(null)} className="p-1 text-indigo-400 hover:text-indigo-600 rounded-full">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm,video/*,image/*"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={mediaItems.length >= 10}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-40"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Medya
                        </button>

                        {/* Etkinlik Ekle butonu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setShowEventPicker(v => !v); fetchEvents(); }}
                                className={`p-2 rounded-full transition-colors flex items-center gap-2 font-medium text-sm ${linkedEvent ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'text-indigo-500 hover:bg-indigo-500/10'}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Etkinlik
                            </button>

                            {showEventPicker && (
                                <div className="absolute left-0 bottom-10 w-72 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">Etkinlik Seç</p>
                                        <button type="button" onClick={() => setShowEventPicker(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto">
                                        {eventsLoading ? (
                                            <div className="py-6 text-center text-sm text-neutral-400">Yükleniyor...</div>
                                        ) : events.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-neutral-400">Etkinlik bulunamadı</div>
                                        ) : events.map(ev => (
                                            <button
                                                key={ev.id}
                                                type="button"
                                                onClick={() => { setLinkedEvent(ev); setShowEventPicker(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                                    {ev.imageUrl ? (
                                                        <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{ev.title}</p>
                                                    <p className="text-xs text-neutral-400">{format(new Date(ev.startDate), "d MMM", { locale: tr })}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {mediaItems.length > 0 && (
                            <span className="text-xs text-neutral-400">{mediaItems.length}/10</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || (mediaItems.length === 0 && !content.trim() && !linkedEvent)}
                        className="group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isSubmitting ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        ) : (
                            <span>Gönder</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

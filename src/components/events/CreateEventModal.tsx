"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface DeleteEventProps {
    eventId: string;
    onClose: () => void;
}

export default function CreateEventModal({ onClose }: { onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Lütfen sadece resim (JPG, PNG) yükleyin.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
            return;
        }

        setMedia(file);
        setMediaPreview(URL.createObjectURL(file));
    };

    const removeMedia = () => {
        setMedia(null);
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
            setMediaPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData(e.currentTarget);

            // Eğer resim eklendiyse, önce resmi yükle
            let uploadedImageUrl = undefined;
            if (media) {
                const uploadData = new FormData();
                uploadData.append("file", media);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                });

                if (!uploadRes.ok) throw new Error("Görsel yüklenirken bir sorun oluştu.");
                const uploadJson = await uploadRes.json();
                uploadedImageUrl = uploadJson.url;
            }

            const isUniversityOnly = formData.get("isUniversityOnly") === "on";

            const { createEvent } = await import("@/app/actions/event");
            await createEvent(formData, uploadedImageUrl);

            // Başarılı olursa onClose()
            onClose();

        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Yeni Etkinlik Oluştur</h2>
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form id="createEventForm" onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Etkinlik Afişi / Fotoğrafı</label>

                            {mediaPreview ? (
                                <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                    <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                                    <button type="button" onClick={removeMedia} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-sm text-neutral-500 font-medium">Fotoğraf Yükle</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleMediaChange} />
                                </label>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Etkinlik Adı <span className="text-rose-500">*</span></label>
                            <input required type="text" name="title" placeholder="Örn: Yapay Zeka Zirvesi 2024" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Açıklama <span className="text-rose-500">*</span></label>
                            <textarea required name="description" rows={4} placeholder="Etkinlik hakkında detaylı bilgi verin..." className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 resize-none custom-scrollbar" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Başlangıç <span className="text-rose-500">*</span></label>
                                <input required type="datetime-local" name="startDate" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Bitiş <span className="text-rose-500">*</span></label>
                                <input required type="datetime-local" name="endDate" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Konum / Yer <span className="text-rose-500">*</span></label>
                            <input required type="text" name="location" placeholder="Örn: AB1 - Reşat Aytaç Oditoryumu veya Online" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                            <input
                                type="checkbox"
                                name="isUniversityOnly"
                                id="isUniversityOnly"
                                defaultChecked
                                className="w-5 h-5 text-rose-500 rounded border-rose-300 dark:border-rose-700 dark:bg-neutral-800 focus:ring-rose-500 cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="isUniversityOnly" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">Sadece Kendi Üniversitem Gürsün</label>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">Bu seçeneği kaldırırsanız, diğer üniversitelerdeki öğrenciler de etkinliğinizi görebilir.</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Ücret Durumu</label>
                            <input type="text" name="price" placeholder="Örn: Ücretsiz, 50 TL, vb. (Boş bırakılabilir)" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50">
                        İptal
                    </button>
                    <button type="submit" form="createEventForm" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Oluşturuluyor...
                            </>
                        ) : "Etkinliği Yayınla"}
                    </button>
                </div>
            </div>
        </div>
    );
}

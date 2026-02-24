"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ClubBadge from "@/components/ui/ClubBadge";
import { deleteEvent } from "@/app/actions/event";

interface EventCardProps {
    event: {
        id: string;
        title: string;
        description: string;
        imageUrl: string | null;
        location: string;
        startDate: Date;
        endDate: Date;
        price: string | null;
        author: {
            id: string;
            name: string | null;
            image: string | null;
            role?: string;
        };
    };
    currentUserId: string;
}

export default function EventCard({ event, currentUserId }: EventCardProps) {
    const isOwner = event.author.id === currentUserId;
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Etkinlik geçmiş mi?
    const isPastEvent = new Date() > new Date(event.endDate);

    const handleDelete = async () => {
        if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;

        setIsDeleting(true);
        try {
            await deleteEvent(event.id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Etkinlik silinirken bir hata oluştu.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={`bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm transition-all hover:shadow-md ${isPastEvent ? 'opacity-70 grayscale-[30%]' : ''}`}>

            {/* Fotoğraf Alanı */}
            {event.imageUrl ? (
                <div className="relative w-full h-48 sm:h-64 bg-neutral-100 dark:bg-neutral-800">
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    {isPastEvent && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-neutral-900/80 backdrop-blur text-white text-xs font-bold rounded-full">
                            Süresi Geçti
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full h-32 bg-gradient-to-br from-rose-100 to-indigo-100 dark:from-rose-500/10 dark:to-indigo-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-rose-300 dark:text-rose-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            <div className="p-5 sm:p-6 space-y-4">
                {/* Başlık ve Kim Paylaştı */}
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                            {event.title}
                        </h3>
                        <Link href={`/user/${event.author.id}`} className="inline-flex items-center gap-2 mt-2 group">
                            {event.author.image ? (
                                <img src={event.author.image} alt="Kulüp Logosu" className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-neutral-950" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-neutral-950">
                                    {event.author.name?.charAt(0).toUpperCase() || "K"}
                                </div>
                            )}
                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-rose-500 transition-colors flex items-center gap-1.5">
                                {event.author.name}
                                {event.author.role === "CLUB" && <ClubBadge />}
                            </span>
                        </Link>
                    </div>

                    {/* Silme Seçeneği (Sadece Sahibi İçin) */}
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
                            title="Etkinliği Sil"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Detay Bilgileri: Yer, Zaman, Ücret */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                    <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {format(new Date(event.startDate), "d MMMM yyyy", { locale: tr })}
                            </span>
                            <span className="text-xs">
                                {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2">
                            {event.location}
                        </span>
                    </div>

                    {event.price && (
                        <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300 sm:col-span-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {event.price}
                            </span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                    {event.description}
                </p>
            </div>
        </div>
    );
}

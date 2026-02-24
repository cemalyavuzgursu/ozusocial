/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface EventMiniCardProps {
    event: {
        id: string;
        title: string;
        imageUrl: string | null;
        startDate: Date;
        location: string;
        author: { name: string | null };
    };
}

export default function EventMiniCard({ event }: EventMiniCardProps) {
    return (
        <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-rose-50 dark:hover:bg-rose-500/5 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all group mt-3 mb-1"
        >
            {/* Küçük görsel veya takvim ikonu */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-rose-100 to-indigo-100 dark:from-rose-500/20 dark:to-indigo-500/20 flex items-center justify-center">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
            </div>

            {/* Bilgiler */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {event.title}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {format(new Date(event.startDate), "d MMM, HH:mm", { locale: tr })} · {event.location}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                    {event.author.name}
                </p>
            </div>

            {/* Oku oku ok */}
            <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-rose-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "@/app/actions/message";

export default function MessageNavIcon() {
    const pathname = usePathname();
    const isActive = pathname?.startsWith('/messages');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // İlk yüklemede ve 5 saniyede bir kontrol et
        const fetchUnreadCount = async () => {
            try {
                const count = await getUnreadMessageCount();
                setUnreadCount(count);
            } catch (error) {
                console.error("Failed to fetch unread message count", error);
            }
        };

        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 5000); // 5 saniyede bir

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Link
            href="/messages"
            className={`relative p-2 rounded-full transition-colors flex items-center justify-center ${isActive ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            title="Mesajlar"
        >
            <svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>

            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-neutral-900 rounded-full animate-in zoom-in"></span>
            )}
        </Link>
    );
}

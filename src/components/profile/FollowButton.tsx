"use client";

import { useTransition, useState } from "react";
import { toggleFollow } from "@/app/actions/follow";

interface FollowButtonProps {
    targetUserId: string;
    initialStatus: "FOLLOWING" | "PENDING" | "UNFOLLOWED";
}

export default function FollowButton({ targetUserId, initialStatus }: FollowButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState(initialStatus);

    // Optimistic UI update combined with actual server action
    const handleFollowToggle = () => {
        startTransition(async () => {
            // Optimistic toggle
            const prevStatus = status;
            if (status === "FOLLOWING" || status === "PENDING") {
                setStatus("UNFOLLOWED");
            } else {
                setStatus("PENDING"); // Assume pending to be safe, or we could leave it to the server response
            }

            try {
                const newStatus = await toggleFollow(targetUserId);
                setStatus(newStatus);
            } catch (error) {
                console.error("Takip işlemi başarısız", error);
                // Revert on failure
                setStatus(prevStatus);
            }
        });
    };

    return (
        <button
            onClick={handleFollowToggle}
            disabled={isPending}
            className={`mt-4 sm:mt-0 px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm z-10 
        ${status === "FOLLOWING"
                    ? "bg-neutral-100 text-neutral-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 border border-neutral-200 dark:border-neutral-700"
                    : status === "PENDING"
                        ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 border border-transparent"
                        : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border border-transparent"}
      `}
        >
            {isPending ? "Bekleniyor..." : status === "FOLLOWING" ? "Takibi Bırak" : status === "PENDING" ? "İstek Gönderildi" : "Takip Et"}
        </button>
    );
}

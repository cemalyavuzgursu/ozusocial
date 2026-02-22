"use client";

import { useState } from "react";
import ReportModal from "./ReportModal";

export default function PostActionsMenu({ postId, isOwner }: { postId: string, isOwner: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Dışarı tıklayınca kapanması için basit blur (isteğe bağlı eklenebilir)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-20 animate-in zoom-in-95 duration-100 origin-top-right">
                    {!isOwner && (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsReportModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Gönderiyi Raporla
                        </button>
                    )}
                    {isOwner && (
                        <div className="px-4 py-2 text-xs text-neutral-400">Bu gönderi size ait.</div>
                    )}
                </div>
            )}

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetType="POST"
                targetId={postId}
            />
        </div>
    );
}

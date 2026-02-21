/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllowedUsersForMessages, getOrCreateConversation } from "@/app/actions/message";

interface UserItem {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
}

export default function NewMessageModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getAllowedUsersForMessages()
                .then(data => setUsers(data as UserItem[]))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    const handleSelectUser = async (userId: string) => {
        try {
            const convId = await getOrCreateConversation(userId);
            setIsOpen(false);
            router.push(`/messages/${convId}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold shadow-md transition-all text-sm flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Yeni Mesaj
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Kimle sohbet edeceksin?</h2>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors bg-neutral-100 dark:bg-neutral-800 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="py-8 flex justify-center">
                                    <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    Sohbet başlatabileceğin kimse yok. Topluluğa katıl ve Öğrenci Kulüplerini takip et!
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">Takip Ettiklerin & Kulüpler</p>
                                    {users.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleSelectUser(u.id)}
                                            className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-700">
                                                {u.image ? (
                                                     
                                                    <img src={u.image} alt={u.name || ""} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold text-lg">
                                                        {u.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1">
                                                    <p className="font-semibold text-neutral-900 dark:text-white">{u.name}</p>
                                                    {u.role === "CLUB" && (
                                                        <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold ml-1">KULÜP</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-500">{u.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

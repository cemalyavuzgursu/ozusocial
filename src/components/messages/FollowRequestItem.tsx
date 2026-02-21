"use client";

import { useState } from "react";
import { respondToFollowRequest } from "@/app/actions/follow-request";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface FollowRequestItemProps {
    request: {
        id: string;
        createdAt: Date;
        sender: {
            id: string;
            name: string | null;
            image: string | null;
            role: string;
        }
    };
}

export default function FollowRequestItem({ request }: FollowRequestItemProps) {
    const [isPending, setIsPending] = useState(false);

    const handleResponse = async (action: "ACCEPT" | "REJECT") => {
        setIsPending(true);
        try {
            await respondToFollowRequest(request.id, action);
        } catch (error) {
            console.error("İstek yanıtlama hatası", error);
            setIsPending(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <Link href={`/user/${request.sender.id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700">
                    {request.sender.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={request.sender.image} alt={request.sender.name || "Kullanıcı"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                            {request.sender.name?.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                        {request.sender.name}
                        {request.sender.role === "CLUB" && (
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.25 rounded-full font-bold">KULÜP</span>
                        )}
                    </h3>
                    <p className="text-xs text-neutral-500">
                        {formatDistanceToNow(request.createdAt, { addSuffix: true, locale: tr })}
                    </p>
                </div>
            </Link>

            <div className="flex gap-2">
                <button
                    onClick={() => handleResponse("ACCEPT")}
                    disabled={isPending}
                    className="px-4 py-1.5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-full text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Onayla
                </button>
                <button
                    onClick={() => handleResponse("REJECT")}
                    disabled={isPending}
                    className="px-4 py-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded-full text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Sil
                </button>
            </div>
        </div>
    );
}

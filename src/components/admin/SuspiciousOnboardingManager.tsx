"use client";

import { approveAgeReview, rejectAgeReview } from "@/app/actions/admin";
import { useState } from "react";

type SuspiciousUser = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    birthYear: number | null;
    department: string | null;
    universityDomain: string | null;
    university: { name: string } | null;
};

export default function SuspiciousOnboardingManager({ initialUsers }: { initialUsers: SuspiciousUser[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();

    async function handleApprove(userId: string) {
        setLoadingId(userId);
        await approveAgeReview(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setLoadingId(null);
    }

    async function handleReject(userId: string) {
        setLoadingId(userId);
        await rejectAgeReview(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setLoadingId(null);
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Şüpheli Onboarding
                    {users.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {users.length}
                        </span>
                    )}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">25 yaş üstü olup sisteme kabul bekleyen kullanıcılar.</p>
            </div>

            {users.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 bg-neutral-900/20">
                    <svg className="w-10 h-10 mx-auto mb-3 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg">İnceleme bekleyen kullanıcı yok.</p>
                    <p className="text-sm mt-1">25 yaş üstü kullanıcılar buraya düşecektir.</p>
                </div>
            ) : (
                <div className="divide-y divide-neutral-800">
                    {users.map(user => {
                        const age = user.birthYear ? currentYear - user.birthYear : null;
                        const isLoading = loadingId === user.id;

                        return (
                            <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-800/20 transition-colors">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 mt-1 flex-shrink-0">
                                        {user.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.image} alt={user.name || "Kullanıcı"} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 bg-neutral-800 text-lg">
                                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-white truncate">{user.name || "İsimsiz Kullanıcı"}</h3>
                                            <span className="text-xs text-neutral-500 font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 truncate">
                                                {user.email}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {age !== null && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {user.birthYear} doğumlu · {age} yaş
                                                </span>
                                            )}
                                            {user.department && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    {user.department}
                                                </span>
                                            )}
                                            {user.university && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                                                    🎓 {user.university.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto border-t md:border-none border-neutral-800 pt-4 md:pt-0 w-full md:w-auto mt-2 md:mt-0">
                                    <button
                                        onClick={() => handleReject(user.id)}
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-sm font-semibold transition-colors border border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "..." : "Uzaklaştır"}
                                    </button>
                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none px-6 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg text-sm font-semibold shadow-lg hover:shadow-green-500/20 transition-all border border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "..." : "Sisteme Al"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

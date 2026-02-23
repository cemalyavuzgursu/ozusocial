/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FollowButton from "@/components/profile/FollowButton";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
};

interface SearchClientProps {
    initialQuery: string;
    initialResults: User[];
    currentUserId: string | undefined;
    initialFollowingIds: string[];
}

export default function SearchClient({
    initialQuery,
    initialResults,
    currentUserId,
    initialFollowingIds,
}: SearchClientProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <main className="max-w-3xl mx-auto flex flex-col gap-6">

            {/* Arama Formu */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-indigo-600 mb-4">
                    Öğrenci Ara
                </h1>
                <form onSubmit={handleSubmit} className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="İsim veya e-posta ile ara..."
                        className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-rose-400 dark:focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 inset-y-2 px-5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Ara
                    </button>
                </form>
            </div>

            {/* Sonuçlar */}
            <section className="flex flex-col gap-4">
                {initialQuery.trim().length === 0 ? (
                    <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                        <svg className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium">Aramaya başla</p>
                        <p className="text-sm mt-1">İsim veya e-posta yaz ve Ara&apos;ya bas</p>
                    </div>
                ) : initialResults.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                        <p className="text-lg font-medium">Kullanıcı bulunamadı.</p>
                        <p className="text-sm mt-1">Farklı bir isim veya mail ile tekrar dene.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-neutral-500 px-1">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">"{initialQuery}"</span> için {initialResults.length} sonuç
                        </p>
                        {initialResults.map((user: any) => {
                            const isFollowing = initialFollowingIds.includes(user.id);
                            return (
                                <div
                                    key={user.id}
                                    className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <Link href={`/user/${user.id}`} className="block relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 group">
                                            {user.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-neutral-500 group-hover:text-rose-500 transition-colors">
                                                    {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </Link>

                                        <div>
                                            <Link href={`/user/${user.id}`} className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                                {user.name}
                                            </Link>
                                            <p className="text-sm text-neutral-500">@{user.email?.split("@")[0]}</p>
                                        </div>
                                    </div>

                                    {user.id !== currentUserId && (
                                        <FollowButton targetUserId={user.id} initialStatus={isFollowing ? "FOLLOWING" : "UNFOLLOWED"} />
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </section>
        </main>
    );
}

"use client";

import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import MessageNavIcon from "./MessageNavIcon";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    return (
        <header className="flex items-center justify-between bg-white dark:bg-neutral-900 px-6 py-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm sticky top-4 z-10 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 mb-6 w-full max-w-3xl mx-auto mt-4 md:mt-8">
            <div className="flex items-center gap-6">
                <Link href="/feed" className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-80 transition-opacity">
                    ÖzüSocial
                </Link>

                <nav className="flex items-center gap-2 sm:gap-4">
                    <Link
                        href="/feed"
                        className={`p-2 rounded-full transition-colors flex items-center justify-center ${pathname === '/feed' ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                        title="Ana Akış"
                    >
                        <svg className="w-6 h-6" fill={pathname === '/feed' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </Link>
                    <Link
                        href="/events"
                        className={`p-2 rounded-full transition-colors flex items-center justify-center ${pathname === '/events' ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                        title="Etkinlikler"
                    >
                        <svg className="w-6 h-6" fill={pathname === '/events' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </Link>
                    <MessageNavIcon />
                </nav>
            </div>

            {/* Arama Çubuğu */}
            <div className="hidden md:flex flex-1 justify-end mx-6">
                <form onSubmit={handleSearch} className="w-full max-w-[180px] focus-within:max-w-xs transition-[max-width] duration-500 ease-out relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400 group-focus-within:text-rose-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Öğrenci Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800/50 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-rose-300 dark:focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 outline-none"
                    />
                </form>
            </div>

            <div className="hidden sm:flex items-center gap-4">
                <AuthButton />
            </div>
        </header >
    );
}

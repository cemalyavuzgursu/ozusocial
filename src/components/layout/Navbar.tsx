"use client";

import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";
import { usePathname } from "next/navigation";
import MessageNavIcon from "./MessageNavIcon";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="flex items-center justify-between bg-white dark:bg-neutral-900 px-4 sm:px-6 py-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm sticky top-4 z-10 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 mb-6 w-full max-w-3xl mx-auto mt-4 md:mt-8">
            <div className="flex items-center gap-3 sm:gap-6">
                <Link href="/feed" className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-80 transition-opacity">
                    UniVibe
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
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

                    {/* Arama İkonu */}
                    <Link
                        href="/search"
                        className={`p-2 rounded-full transition-colors flex items-center justify-center ${pathname === '/search' ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                        title="Öğrenci Ara"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </Link>
                </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <AuthButton />
            </div>
        </header>
    );
}

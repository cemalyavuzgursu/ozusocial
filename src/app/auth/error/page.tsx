"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-950">
            <main className="flex flex-col items-center gap-6 max-w-lg text-center bg-white dark:bg-neutral-900 p-8 sm:p-12 rounded-[2rem] shadow-xl border border-neutral-200 dark:border-neutral-800">

                <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Giriş Reddedildi
                </h1>

                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {error === "AccessDenied"
                        ? "Ooo hayır! ÖzüSocial kapalı devre bir sosyal ağdır. Sisteme giriş yapabilmek için yöneticiler tarafından eklenmiş bir üniversitenin kurumsal e-posta adresiyle (örneğin @yildiz.edu.tr, @ozyegin.edu.tr vb.) giriş yapmanız gerekmektedir."
                        : "Giriş yaparken bir şeyler ters gitti. Lütfen geçerli bir üniversite hesabıyla tekrar deneyin."}
                </p>

                <Link
                    href="/"
                    className="mt-4 px-8 py-3 rounded-full text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 transition-colors duration-200"
                >
                    Ana Sayfaya Dön
                </Link>
            </main>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">Yükleniyor...</div>}>
            <AuthErrorContent />
        </Suspense>
    );
}

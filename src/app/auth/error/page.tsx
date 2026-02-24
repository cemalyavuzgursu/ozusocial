"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const isBanned = error === "Banned";

    const tryDifferentAccount = async () => {
        // prompt=select_account ile Google hesap seçiciyi zorla, böylece çerezden isko hesap atlanır
        await signIn("google", { callbackUrl: "/" }, { prompt: "select_account" });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-950">
            <main className="flex flex-col items-center gap-6 max-w-lg text-center bg-white dark:bg-neutral-900 p-8 sm:p-12 rounded-[2rem] shadow-xl border border-neutral-200 dark:border-neutral-800">

                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 ${isBanned ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {isBanned ? "Hesabın Askıya Alındı" : "Giriş Reddedildi"}
                </h1>

                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {isBanned
                        ? "Hesabın yönetici tarafından askıya alınmıştır. Detaylar için destek ekibiyle iletişime geç."
                        : error === "AccessDenied"
                            ? "UniVibe kapalı devre bir sosyal ağdır. Giriş yapabilmek için kayıtlı bir üniversitenin kurumsal e-posta adresiyle (örn. @ozyegin.edu.tr) giriş yapmalısın."
                            : "Giriş yaparken bir şeyler ters gitti. Lütfen geçerli bir üniversite hesabıyla tekrar dene."}
                </p>

                <div className="flex flex-col gap-3 w-full mt-2">
                    {!isBanned && (
                        <button
                            onClick={tryDifferentAccount}
                            className="w-full px-8 py-3 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors duration-200"
                        >
                            Farklı Hesapla Dene
                        </button>
                    )}
                    <Link
                        href="/"
                        className="px-8 py-3 rounded-full text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>
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

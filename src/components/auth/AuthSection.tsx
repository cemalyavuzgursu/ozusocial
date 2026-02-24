/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/register";
import { useRouter } from "next/navigation";

type Tab = "google" | "login" | "register";

export default function AuthSection() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("google");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true); setError(""); setSuccess("");
        const fd = new FormData(e.currentTarget);
        const email = fd.get("email") as string;
        const password = fd.get("password") as string;

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("E-posta veya şifre hatalı.");
        } else {
            router.push("/feed");
            router.refresh();
        }
        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true); setError(""); setSuccess("");
        const fd = new FormData(e.currentTarget);

        try {
            await registerUser(fd);
            setSuccess("Hesap oluşturuldu! Şimdi giriş yapabilirsiniz.");
            setTab("login");
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/feed" });
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Tab switcher */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1 mb-6 gap-1">
                {([
                    { key: "google", label: "Google" },
                    { key: "login", label: "Giriş Yap" },
                    { key: "register", label: "Kayıt Ol" },
                ] as { key: Tab; label: string }[]).map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setTab(t.key); setError(""); setSuccess(""); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-sm text-emerald-600 dark:text-emerald-400">
                    {success}
                </div>
            )}

            {/* Google */}
            {tab === "google" && (
                <button
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white dark:border-black/40 dark:border-t-black rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    Google ile Devam Et
                </button>
            )}

            {/* Login */}
            {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="okul@universite.edu.tr"
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                        type="password"
                        name="password"
                        required
                        placeholder="Şifre"
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                    >
                        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>
            )}

            {/* Register */}
            {tab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Ad Soyad"
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="okul@universite.edu.tr"
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="space-y-2">
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Şifre (min. 8 karakter, harf + rakam)"
                            className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            placeholder="Şifreyi tekrarla"
                            className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                        />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        ✓ En az 8 karakter &nbsp; ✓ Harf ve rakam içermeli
                    </p>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                    >
                        {isLoading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                    </button>
                </form>
            )}
        </div>
    );
}

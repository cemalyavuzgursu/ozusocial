/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/register";
import { useRouter } from "next/navigation";

type EmailTab = "login" | "register";

export default function AuthSection() {
    const router = useRouter();
    const [showEmail, setShowEmail] = useState(false);
    const [emailTab, setEmailTab] = useState<EmailTab>("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true); setError(""); setSuccess("");
        const fd = new FormData(e.currentTarget);
        const result = await signIn("credentials", {
            email: fd.get("email") as string,
            password: fd.get("password") as string,
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
        try {
            await registerUser(new FormData(e.currentTarget));
            setSuccess("Hesap oluşturuldu! Giriş yapabilirsiniz.");
            setEmailTab("login");
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

    const inputCls = "w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm outline-none focus:ring-2 focus:ring-rose-500 transition-all";

    return (
        <div className="w-full space-y-3">
            {/* Ana butonlar: yan yana */}
            <div className="flex gap-3">
                {/* Google */}
                <button
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
                >
                    {isLoading && !showEmail ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white dark:border-black/40 dark:border-t-black rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    <span className="whitespace-nowrap">Google ile Giriş</span>
                </button>

                {/* E-posta ile Giriş / Kayıt Ol */}
                <button
                    onClick={() => { setShowEmail(v => !v); setError(""); setSuccess(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm ${showEmail
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 ring-1 ring-inset ring-neutral-200 dark:ring-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        }`}
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="whitespace-nowrap">Giriş / Kayıt</span>
                </button>
            </div>

            {/* E-posta formu — aşağı açılır */}
            {showEmail && (
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Mini tab: Giriş / Kayıt */}
                    <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-0.5">
                        {(["login", "register"] as EmailTab[]).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => { setEmailTab(t); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2 rounded-[10px] text-sm font-semibold transition-all ${emailTab === t ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500'}`}
                            >
                                {t === "login" ? "Giriş Yap" : "Kayıt Ol"}
                            </button>
                        ))}
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    {success && <p className="text-xs text-emerald-600 font-medium">{success}</p>}

                    {emailTab === "login" ? (
                        <form onSubmit={handleLogin} className="space-y-3">
                            <input type="email" name="email" required placeholder="okul@universite.edu.tr" className={inputCls} />
                            <input type="password" name="password" required placeholder="Şifre" className={inputCls} />
                            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3">
                            <input type="text" name="name" required placeholder="Ad Soyad" className={inputCls} />
                            <input type="email" name="email" required placeholder="okul@universite.edu.tr" className={inputCls} />
                            <input type="password" name="password" required placeholder="Şifre (min. 8 karakter, harf+rakam)" className={inputCls} />
                            <input type="password" name="confirmPassword" required placeholder="Şifreyi tekrarla" className={inputCls} />
                            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                                {isLoading ? "Oluşturuluyor..." : "Hesap Oluştur"}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

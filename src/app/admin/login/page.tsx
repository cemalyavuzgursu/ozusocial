"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await loginAdmin(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // Başarılıysa server action zaten redirect atıyor
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">ÖzüSocial Admin Merkezi</h1>
                    <p className="text-neutral-500 text-sm">Sistem yönetimine giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border-none text-white focus:ring-2 focus:ring-rose-500 transition-shadow outline-none"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Parola</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-neutral-800 border-none text-white focus:ring-2 focus:ring-rose-500 transition-shadow outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-rose-500 text-sm font-medium text-center bg-rose-500/10 py-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>
            </div>
        </div>
    );
}

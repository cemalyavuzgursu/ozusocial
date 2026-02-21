"use client";

import { useState, useTransition } from "react";
import { createUser } from "@/app/actions/admin";

export default function CreateUserForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"STUDENT" | "CLUB" | "ADMIN">("STUDENT");
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!name.trim() || !email.trim()) {
            setStatus({ type: 'error', msg: 'Lütfen tüm alanları doldurun.' });
            return;
        }

        startTransition(async () => {
            try {
                await createUser({ name: name.trim(), email: email.trim().toLowerCase(), role });
                setStatus({ type: 'success', msg: 'Kullanıcı başarıyla oluşturuldu.' });
                setName("");
                setEmail("");
                setRole("STUDENT");
            } catch (error: any) {
                setStatus({ type: 'error', msg: error.message || 'Kullanıcı oluşturulamadı.' });
            }
        });
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl mt-6">
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Yeni Kullanıcı / Kulüp Hesabı Ekle
                </h2>
                <p className="text-xs text-neutral-400">Öğrencilerin otomatik kaydolmasını beklemeden sisteme yeni yetkili kulüp maili veya bir kullanıcı tanımlayabilirsiniz.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-neutral-400">İsim / Kulüp Adı</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Örn: Müzik Kulübü"
                            className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-neutral-400">E-Posta Adresi</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Örn: muho@ozu.edu.tr"
                            className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    <div className="sm:w-48 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-neutral-400">Kullanıcı Rolü</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                            className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors text-white"
                        >
                            <option value="STUDENT">Öğrenci</option>
                            <option value="CLUB">Onaylı Kulüp</option>
                            <option value="ADMIN">Yönetici</option>
                        </select>
                    </div>
                </div>

                {status && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {status.msg}
                    </div>
                )}

                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-green-500/20 transition-all disabled:opacity-50"
                    >
                        {isPending ? "Oluşturuluyor..." : "Hesabı Oluştur"}
                    </button>
                </div>
            </form>
        </div>
    );
}

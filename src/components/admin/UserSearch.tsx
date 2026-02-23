"use client";

import { useState, useTransition, useEffect } from "react";
import { searchUsers, toggleBanUser, deleteUser, changeUserRole } from "@/app/actions/admin";
import Link from "next/link";

type SearchedUser = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isBanned: boolean;
};

export default function UserSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchedUser[]>([]);
    const [isPending, startTransition] = useTransition();
    const [openBanMenuId, setOpenBanMenuId] = useState<string | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            startTransition(async () => {
                try {
                    const res = await searchUsers(query);
                    setResults(res as SearchedUser[]);
                } catch (error) {
                    console.error("Arama hatası", error);
                }
            });
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Zaten useEffect ile otomatik aranıyor, form submitini boş bırakabiliriz
    };

    const handleBanToggle = async (userId: string, durationDays: number | null = null) => {
        try {
            const isBannedNow = await toggleBanUser(userId, durationDays);
            // Update local state
            setResults(prev => prev.map(u => u.id === userId ? { ...u, isBanned: isBannedNow } : u));
            setOpenBanMenuId(null);
        } catch (error) {
            console.error("Ban toggle hatası", error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("DİKKAT! Bu kullanıcıyı kalıcı olarak silmek üzeresiniz. Bu kullanıcının tüm mesajları, postları, etkileşimleri ve eğitim bilgileri kaskad bir şekilde silinecektir. Emin misiniz?")) return;

        try {
            await deleteUser(userId);
            // Remove user from the DOM without pinging server repeatedly
            setResults(prev => prev.filter(u => u.id !== userId));
        } catch (error: any) {
            console.error("Kullanıcı silinirken hata", error);
            alert("Silme başarısız oldu: " + (error?.message || "Bilinmeyen bir hata."));
        }
    };

    const handleRoleChange = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "CLUB" ? "STUDENT" : "CLUB";
        if (!confirm(`Kullanıcının rolünü ${newRole} olarak değiştirmek istiyor musunuz?`)) return;

        try {
            await changeUserRole(userId, newRole as any);
            setResults(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error: any) {
            console.error("Rol değiştirme hatası", error);
            alert("Hata: " + (error?.message || "Bilinmeyen bir hata."));
        }
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl mt-6">
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Kullanıcı Arama ve Yönetimi
                </h2>

                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="İsim veya e-posta ile ara..."
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Aranıyor..." : "Ara"}
                    </button>
                </form>
            </div>

            <div className="divide-y divide-neutral-800">
                {results.length === 0 && query && !isPending ? (
                    <div className="p-8 text-center text-neutral-500">
                        Sonuç bulunamadı.
                    </div>
                ) : (
                    results.map(user => (
                        <div key={user.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/20 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
                                    {user.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                                            {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{user.name}</h3>
                                        {user.role === "CLUB" && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">KULÜP</span>}
                                        {user.isBanned && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30 font-bold">YASAKLI</span>}
                                    </div>
                                    <p className="text-sm text-neutral-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <Link
                                    href={`/user/${user.id}`}
                                    target="_blank"
                                    className="flex-1 sm:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold text-center transition-colors border border-neutral-700"
                                >
                                    Profil
                                </Link>
                                <button
                                    onClick={() => handleRoleChange(user.id, user.role)}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors border ${user.role === "CLUB"
                                        ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500 hover:text-white"
                                        : "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white"
                                        }`}
                                >
                                    {user.role === "CLUB" ? "Öğrenci Yap" : "Kulüp Yap"}
                                </button>
                                <div className="relative flex-1 sm:flex-none">
                                    {user.isBanned ? (
                                        <button
                                            onClick={() => handleBanToggle(user.id)}
                                            className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors border bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                                        >
                                            Yasağı Kaldır
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setOpenBanMenuId(openBanMenuId === user.id ? null : user.id)}
                                                className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors border bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white flex items-center justify-center gap-1"
                                            >
                                                Yasakla (Ban)
                                                <svg className={`w-4 h-4 transition-transform ${openBanMenuId === user.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>

                                            {openBanMenuId === user.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                                    <div className="py-1 flex flex-col">
                                                        <button onClick={() => handleBanToggle(user.id, 1)} className="px-4 py-2 text-sm text-left text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">1 Gün</button>
                                                        <button onClick={() => handleBanToggle(user.id, 7)} className="px-4 py-2 text-sm text-left text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">1 Hafta</button>
                                                        <button onClick={() => handleBanToggle(user.id, 30)} className="px-4 py-2 text-sm text-left text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">1 Ay</button>
                                                        <button onClick={() => handleBanToggle(user.id, 90)} className="px-4 py-2 text-sm text-left text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">3 Ay</button>
                                                        <button onClick={() => handleBanToggle(user.id, 180)} className="px-4 py-2 text-sm text-left text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">6 Ay</button>
                                                        <button onClick={() => handleBanToggle(user.id, 365)} className="px-4 py-2 text-sm text-left text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">1 Yıl</button>
                                                        <div className="border-t border-neutral-700 my-1"></div>
                                                        <button onClick={() => handleBanToggle(user.id, null)} className="px-4 py-2 text-sm text-left text-rose-400 hover:bg-rose-500/20 transition-colors font-medium">Süresiz Yasakla</button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold text-center transition-colors"
                                >
                                    Sil (Delete)
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

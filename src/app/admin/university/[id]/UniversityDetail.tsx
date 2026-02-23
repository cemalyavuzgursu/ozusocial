"use client";

import { useState } from "react";
import { updateUniversity } from "@/app/actions/admin";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UniversityDetail({ initialUniversity, initialUsers }: { initialUniversity: any, initialUsers: any[] }) {
    const router = useRouter();
    const [name, setName] = useState(initialUniversity.name);
    const [domain, setDomain] = useState(initialUniversity.domain);
    const [departmentInput, setDepartmentInput] = useState("");
    const [departments, setDepartments] = useState<string[]>(
        initialUniversity.departments
            ? initialUniversity.departments.split(',').map((d: string) => d.trim()).filter(Boolean)
            : []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleAddDepartment = () => {
        if (departmentInput.trim() && !departments.includes(departmentInput.trim())) {
            setDepartments([...departments, departmentInput.trim()]);
            setDepartmentInput("");
        }
    };

    const handleRemoveDepartment = (dep: string) => {
        setDepartments(departments.filter(d => d !== dep));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await updateUniversity(initialUniversity.id, name, domain, departments.join(", "));
            setSuccess(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Güncellenirken bir hata oluştu.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{initialUniversity.name}</h1>
                    <p className="text-emerald-400 font-mono text-sm mt-1">@{initialUniversity.domain}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editing Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-white mb-6 border-b border-neutral-800 pb-4">Okulu Düzenle</h2>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Okul Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">E-posta Uzantısı</label>
                                <input
                                    type="text"
                                    required
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                    Bölümler
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={departmentInput}
                                        onChange={(e) => setDepartmentInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddDepartment();
                                            }
                                        }}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        placeholder="Yeni Bölüm Ekle..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDepartment}
                                        className="px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold"
                                    >
                                        Ekle
                                    </button>
                                </div>
                                {departments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800">
                                        {departments.map(dep => (
                                            <div key={dep} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs">
                                                <span>{dep}</span>
                                                <button type="button" onClick={() => handleRemoveDepartment(dep)} className="hover:text-rose-400 ml-1">
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && <p className="text-rose-500 text-sm bg-rose-500/10 p-3 rounded">{error}</p>}
                            {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded">Değişiklikler kaydedildi.</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-all mt-4"
                            >
                                {loading ? "Kaydediliyor..." : "Tümünü Kaydet"}
                            </button>
                        </form>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-neutral-400">Toplam Kayıtlı Öğrenci</h3>
                            <p className="text-3xl font-bold text-white mt-1">{initialUsers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl min-h-[500px]">
                        <h2 className="text-lg font-semibold text-white mb-6 border-b border-neutral-800 pb-4">Kayıtlı Öğrenciler</h2>

                        {initialUsers.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                                Bu okula kayıtlı kimse bulunmuyor.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {initialUsers.map((user) => (
                                    <div key={user.id} className="flex items-center gap-4 p-3 bg-neutral-950/50 border border-neutral-800 rounded-xl hover:bg-neutral-800/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                                                    {user.name?.charAt(0) || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-white truncate text-sm">{user.name}</h4>
                                            <p className="text-neutral-500 text-xs truncate">{user.email}</p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400' : user.role === 'CLUB' ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-800 text-neutral-300'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

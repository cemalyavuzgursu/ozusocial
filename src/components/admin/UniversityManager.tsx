"use client";

import { useState } from "react";
import { createUniversity, deleteUniversity, updateUniversityDepartments } from "@/app/actions/admin";

export default function UniversityManager({ initialUniversities }: { initialUniversities: any[] }) {
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [departments, setDepartments] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDepartments, setEditDepartments] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createUniversity(name, domain, departments);
            setName("");
            setDomain("");
            setDepartments("");
        } catch (err: any) {
            setError(err.message || "Bilinmeyen bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDepartments = async (id: string) => {
        setEditLoading(true);
        try {
            await updateUniversityDepartments(id, editDepartments);
            setEditingId(null);
        } catch (err: any) {
            alert(err.message || "Departmanlar güncellenirken hata oluştu.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu üniversiteyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz! O okuldaki öğrenciler artık sisteme giriş yapamayacaktır.")) return;

        try {
            await deleteUniversity(id);
        } catch (err: any) {
            alert(err.message || "Bilinmeyen bir hata oluştu.");
        }
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Üniversite & E-posta Uzantısı Yönetimi
                </h2>
                <p className="text-xs text-neutral-400 mt-1 pl-7">
                    Sisteme kayıt olabilecek ve giriş yapabilecek kullanıcıların okul uzantılarını buradan ayarlayabilirsiniz.
                </p>
            </div>

            <div className="p-6">
                <form onSubmit={handleCreate} className="flex gap-4 items-end mb-8 flex-wrap md:flex-nowrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            Okul Adı
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                            placeholder="Örn: Yıldız Teknik Üniversitesi"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            E-posta Uzantısı
                        </label>
                        <input
                            type="text"
                            required
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                            placeholder="Örn: yildiz.edu.tr (Sadece uzantı)"
                        />
                    </div>
                    <div className="flex-1 min-w-[300px] w-full mt-4 md:mt-0">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                            Bölümler (Virgülle Ayırın) <span className="text-neutral-500 font-normal lowercase">- isteğe bağlı</span>
                        </label>
                        <input
                            type="text"
                            value={departments}
                            onChange={(e) => setDepartments(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                            placeholder="Örn: Bilgisayar Mühendisliği, Hukuk, Tıp"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 transition-all mt-4 md:mt-0"
                    >
                        {loading ? "Ekleniyor..." : "Ekle"}
                    </button>
                </form>

                {error && <div className="text-rose-500 text-sm mb-4 bg-rose-500/10 p-3 rounded">{error}</div>}

                {initialUniversities.length === 0 ? (
                    <div className="text-center py-6 text-neutral-500 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                        Henüz hiç kayıtlı okul yok.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {initialUniversities.map((uni: any) => (
                            <div key={uni.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-white break-words pr-8">{uni.name}</h3>
                                    <p className="text-emerald-400 text-sm font-mono mt-1">@{uni.domain}</p>
                                    <p className="text-xs text-neutral-500 mt-2">{uni._count?.users || 0} kayıtlı öğrenci</p>

                                    {/* Departman Düzenleme Alanı */}
                                    <div className="mt-4">
                                        {editingId === uni.id ? (
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    value={editDepartments}
                                                    onChange={(e) => setEditDepartments(e.target.value)}
                                                    className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded p-2 text-white outline-none focus:border-emerald-500"
                                                    placeholder="Virgülle ayrılmış bölümler..."
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 text-neutral-400 hover:text-white">İptal</button>
                                                    <button
                                                        onClick={() => handleUpdateDepartments(uni.id)}
                                                        disabled={editLoading}
                                                        className="text-xs px-2 py-1 bg-emerald-600/20 text-emerald-500 rounded hover:bg-emerald-600/40 font-medium"
                                                    >
                                                        {editLoading ? "..." : "Kaydet"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group cursor-pointer" onClick={() => { setEditingId(uni.id); setEditDepartments(uni.departments || ""); }}>
                                                <p className="text-xs text-neutral-400 border-b border-dashed border-neutral-700 pb-1 mb-1 inline-block">Bölümler (Düzenle)</p>
                                                <p className="text-xs text-neutral-500 line-clamp-2" title={uni.departments || "Bölüm eklenmemiş."}>
                                                    {uni.departments || <span className="italic opacity-50">Bölüm eklenmemiş.</span>}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(uni.id)}
                                        className="text-xs text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-1.5 rounded transition-colors"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

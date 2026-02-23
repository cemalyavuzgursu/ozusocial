"use client";

import { useState } from "react";
import { createUniversity, deleteUniversity } from "@/app/actions/admin";
import Link from "next/link";

export default function UniversityManager({ initialUniversities }: { initialUniversities: any[] }) {
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [departmentInput, setDepartmentInput] = useState("");
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createUniversity(name, domain, departments.join(", "));
            setName("");
            setDomain("");
            setDepartments([]);
            setDepartmentInput("");
        } catch (err: any) {
            setError(err.message || "Bilinmeyen bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = () => {
        if (departmentInput.trim() && !departments.includes(departmentInput.trim())) {
            setDepartments([...departments, departmentInput.trim()]);
            setDepartmentInput("");
        }
    };

    const handleRemoveDepartment = (dep: string) => {
        setDepartments(departments.filter(d => d !== dep));
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
                    Sisteme kayıt olabilecek okulları buradan yönetebilir ve kartlara tıklayarak detaylarını görebilirsiniz.
                </p>
            </div>

            <div className="p-6">
                <form onSubmit={handleCreate} className="mb-8 bg-neutral-950/30 p-4 rounded-xl border border-neutral-800/50">
                    <h3 className="text-sm font-semibold text-white mb-4">Yeni Okul Ekle</h3>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                Okul Adı
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                placeholder="Örn: Yıldız Teknik Üniversitesi"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                E-posta Uzantısı
                            </label>
                            <input
                                type="text"
                                required
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                placeholder="Örn: yildiz.edu.tr (Sadece uzantı)"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                Bölümler <span className="text-neutral-500 font-normal lowercase">- isteğe bağlı (birden fazla ekleyebilirsiniz)</span>
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
                                    placeholder="Örn: Bilgisayar Mühendisliği (Yazıp Enter'a veya Ekle'ye basın)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddDepartment}
                                    className="px-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold h-[42px]"
                                >
                                    Ekle
                                </button>
                            </div>
                            {departments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800 min-h-[40px]">
                                    {departments.map(dep => (
                                        <div key={dep} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs">
                                            <span>{dep}</span>
                                            <button type="button" onClick={() => handleRemoveDepartment(dep)} className="hover:text-rose-400 ml-1 cursor-pointer">
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-[150px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-all mt-4 md:mt-0 h-[42px]"
                        >
                            {loading ? "Kaydediyor..." : "Okulu Kaydet"}
                        </button>
                    </div>
                </form>

                {error && <div className="text-rose-500 text-sm mb-4 bg-rose-500/10 p-3 rounded">{error}</div>}

                {initialUniversities.length === 0 ? (
                    <div className="text-center py-6 text-neutral-500 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                        Henüz hiç kayıtlı okul yok.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {initialUniversities.map((uni: any) => (
                            <Link
                                href={`/admin/university/${uni.id}`}
                                key={uni.id}
                                className="group bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-neutral-900 transition-all cursor-pointer relative"
                            >
                                <div>
                                    <h3 className="font-semibold text-white break-words pr-8 group-hover:text-emerald-400 transition-colors">{uni.name}</h3>
                                    <p className="text-emerald-500/70 text-sm font-mono mt-1 mb-3 bg-emerald-500/10 inline-block px-2 py-0.5 rounded">@{uni.domain}</p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        <p className="text-xs text-neutral-400 font-medium">{uni._count?.users || 0} kayıtlı öğrenci</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-3 line-clamp-2 overflow-hidden h-10">
                                        {uni.departments ? (
                                            uni.departments.split(',').map((d: string) => d.trim()).filter(Boolean).map((dep: string) => (
                                                <span key={dep} className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px] border border-neutral-700/50 whitespace-nowrap">
                                                    {dep}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="italic opacity-50 text-xs text-neutral-600">Bölüm eklenmemiş</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-neutral-800/50 flex justify-between items-center group-hover:border-neutral-700/50 transition-colors">
                                    <span className="text-xs font-semibold text-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity">
                                        Okulu Yönet →
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(uni.id, e)}
                                        className="text-xs text-neutral-500 hover:text-white hover:bg-rose-500 px-3 py-1.5 rounded transition-colors z-10"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

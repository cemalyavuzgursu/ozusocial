"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { resolveReport } from "@/app/actions/report";

type Report = {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: Date;
    reporter: {
        id: string;
        name: string | null;
        email: string | null;
    };
};

export default function ReportManager({ initialReports }: { initialReports: Report[] }) {
    const [reports, setReports] = useState(initialReports);
    const [filter, setFilter] = useState("PENDING");
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const filteredReports = reports.filter(r => filter === "ALL" ? true : r.status === filter);

    const handleAction = async (reportId: string, action: "REJECT" | "DELETE_TARGET") => {
        if (action === "DELETE_TARGET" && !confirm("Hedef içeriği/kullanıcıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setIsProcessing(reportId);
        try {
            await resolveReport(reportId, action);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === "REJECT" ? "REJECTED" : "RESOLVED" } : r));
        } catch (error: any) {
            console.error("Report action error", error);
            alert(error.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setIsProcessing(null);
        }
    };

    const getTargetLink = (type: string, id: string) => {
        if (type === "USER") return `/user/${id}`;
        // Uygulamamızda tekil post detay sayfası varsa ona yönlendirebiliriz, yoksa anasayfa
        if (type === "POST") return `/feed`;
        return `/feed`;
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl mt-6">
            <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Kullanıcı Raporları
                    <span className="bg-rose-500/10 text-rose-500 text-xs px-2 py-0.5 rounded-full ml-2">
                        {reports.filter(r => r.status === "PENDING").length} Bekleyen
                    </span>
                </h2>

                <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 shrink-0">
                    <button onClick={() => setFilter("ALL")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "ALL" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>Tümü</button>
                    <button onClick={() => setFilter("PENDING")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "PENDING" ? "bg-neutral-800 text-rose-400" : "text-neutral-500 hover:text-rose-500/50"}`}>Bekleyenler</button>
                    <button onClick={() => setFilter("RESOLVED")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "RESOLVED" ? "bg-neutral-800 text-green-400" : "text-neutral-500 hover:text-green-500/50"}`}>Çözülen</button>
                    <button onClick={() => setFilter("REJECTED")} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === "REJECTED" ? "bg-neutral-800 text-neutral-400" : "text-neutral-500 hover:text-neutral-400/50"}`}>Reddedilen</button>
                </div>
            </div>

            {filteredReports.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 bg-neutral-900/20">
                    <p className="text-lg">Gösterilecek rapor bulunamadı.</p>
                </div>
            ) : (
                <div className="divide-y divide-neutral-800">
                    {filteredReports.map(report => (
                        <div key={report.id} className="p-6 flex flex-col hover:bg-neutral-800/20 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${report.targetType === 'POST' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                report.targetType === 'COMMENT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                            {report.targetType === 'POST' ? 'GÖNDERİ' : report.targetType === 'COMMENT' ? 'YORUM' : 'KULLANICI'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${report.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                report.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                                            }`}>
                                            {report.status === 'PENDING' ? 'Bekliyor' : report.status === 'RESOLVED' ? 'Çözüldü' : 'Reddedildi'}
                                        </span>
                                        <span className="text-xs text-neutral-500 flex items-center gap-1 ml-2">
                                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: tr })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-neutral-500">Raporlayan:</span>
                                        <span className="font-semibold text-neutral-200 text-sm">{report.reporter.name || "İsimsiz"}</span>
                                        <Link href={`/user/${report.reporter.id}`} target="_blank" className="text-xs text-indigo-400 hover:underline">
                                            (Profil)
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={getTargetLink(report.targetType, report.targetId)}
                                        target="_blank"
                                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors border border-neutral-700"
                                    >
                                        Hedefi İncele {report.targetType !== "USER" && "(Tümü İçinde)"}
                                    </Link>
                                    {report.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(report.id, 'REJECT')}
                                                disabled={isProcessing === report.id}
                                                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-neutral-700 disabled:opacity-50"
                                            >
                                                Reddet (Sorun Yok)
                                            </button>
                                            <button
                                                onClick={() => handleAction(report.id, 'DELETE_TARGET')}
                                                disabled={isProcessing === report.id}
                                                className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-rose-500/20 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isProcessing === report.id ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : null}
                                                İhlali Onayla & Hedefi Sil
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 mt-2">
                                <p className="text-sm font-medium text-neutral-400 mb-1">Şikayet Nedeni:</p>
                                <p className="text-sm text-neutral-200 whitespace-pre-wrap">{report.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

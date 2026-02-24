/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { saveEventForm } from "@/app/actions/form";
import { useRouter } from "next/navigation";

const FIELD_TYPES = [
    { value: "TEXT", label: "Kısa Metin" },
    { value: "EMAIL", label: "E-posta" },
    { value: "PHONE", label: "Telefon" },
    { value: "SELECT", label: "Çoktan Seçme" },
    { value: "CHECKBOX", label: "Onay Kutusu" },
];

interface Field {
    id: string;
    label: string;
    type: string;
    options: string;
    required: boolean;
    order: number;
}

export default function FormBuilderClient({ eventId, eventTitle, initialFields }: {
    eventId: string;
    eventTitle: string;
    initialFields: Field[];
}) {
    const router = useRouter();
    const [fields, setFields] = useState<Field[]>(
        initialFields.length > 0 ? initialFields :
            // Varsayılan alanlar
            [
                { id: "default-1", label: "Ad Soyad", type: "TEXT", options: "", required: true, order: 0 },
                { id: "default-2", label: "E-posta", type: "EMAIL", options: "", required: true, order: 1 },
            ]
    );
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const addField = () => {
        setFields(prev => [...prev, {
            id: `new-${Date.now()}`,
            label: "Yeni Alan",
            type: "TEXT",
            options: "",
            required: false,
            order: prev.length
        }]);
    };

    const updateField = (id: string, update: Partial<Field>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...update } : f));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id).map((f, i) => ({ ...f, order: i })));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        setFields(prev => {
            const n = [...prev];
            [n[index - 1], n[index]] = [n[index], n[index - 1]];
            return n.map((f, i) => ({ ...f, order: i }));
        });
    };

    const moveDown = (index: number) => {
        setFields(prev => {
            if (index >= prev.length - 1) return prev;
            const n = [...prev];
            [n[index], n[index + 1]] = [n[index + 1], n[index]];
            return n.map((f, i) => ({ ...f, order: i }));
        });
    };

    const handleSave = async () => {
        if (fields.length === 0) { setError("En az bir alan ekleyin."); return; }
        setIsSaving(true); setError("");
        try {
            await saveEventForm(eventId, fields.map(f => ({
                label: f.label,
                type: f.type,
                options: f.options || undefined,
                required: f.required,
                order: f.order
            })));
            setSaved(true);
            setTimeout(() => { router.push("/club"); }, 1200);
        } catch (e: any) {
            setError(e.message || "Kaydedilemedi.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Etkinlik</h2>
                <p className="font-semibold text-neutral-900 dark:text-white">{eventTitle}</p>
            </div>

            <div className="space-y-3">
                {fields.map((field, idx) => (
                    <div key={field.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 space-y-3">
                        <div className="flex items-center gap-2">
                            {/* Sıralama butonları */}
                            <div className="flex flex-col gap-0.5">
                                <button type="button" onClick={() => moveUp(idx)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded disabled:opacity-20" disabled={idx === 0}>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button type="button" onClick={() => moveDown(idx)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded disabled:opacity-20" disabled={idx === fields.length - 1}>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>

                            <input
                                value={field.label}
                                onChange={e => updateField(field.id, { label: e.target.value })}
                                placeholder="Alan adı"
                                className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500"
                            />

                            <select
                                value={field.type}
                                onChange={e => updateField(field.id, { type: e.target.value })}
                                className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500"
                            >
                                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>

                            <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={e => updateField(field.id, { required: e.target.checked })}
                                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                                />
                                Zorunlu
                            </label>

                            <button type="button" onClick={() => removeField(field.id)} className="p-1.5 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {field.type === "SELECT" && (
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Seçenekler (virgülle ayırın)</p>
                                <input
                                    value={field.options}
                                    onChange={e => updateField(field.id, { options: e.target.value })}
                                    placeholder="Seçenek 1, Seçenek 2, Seçenek 3"
                                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addField}
                className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-neutral-500 hover:border-rose-400 hover:text-rose-500 transition-colors"
            >
                + Alan Ekle
            </button>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => router.push("/club")}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                    Vazgeç
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || saved}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors"
                >
                    {saved ? "✓ Kaydedildi!" : isSaving ? "Kaydediliyor..." : "Formu Kaydet"}
                </button>
            </div>
        </div>
    );
}

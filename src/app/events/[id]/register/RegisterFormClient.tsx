/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { submitFormResponse } from "@/app/actions/form";
import { useRouter } from "next/navigation";

interface FormField {
    id: string;
    label: string;
    type: string;
    options?: string | null;
    required: boolean;
}

export default function RegisterFormClient({ formId, eventId, fields }: {
    formId: string;
    eventId: string;
    fields: FormField[];
}) {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (fieldId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            await submitFormResponse(formId, answers);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    ✓
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Kayıt Tamamlandı!</h2>
                <p className="text-neutral-500 mb-6">Başvurunuz kulübe iletildi.</p>
                <button
                    onClick={() => router.push(`/events/${eventId}`)}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                    Etkinliğe Geri Dön
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-5">
            {fields.map(field => (
                <div key={field.id} className="space-y-1.5">
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {field.label}
                        {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>

                    {field.type === "TEXT" && (
                        <input
                            type="text"
                            required={field.required}
                            value={answers[field.id] || ""}
                            onChange={e => handleChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500 transition-colors"
                        />
                    )}
                    {field.type === "EMAIL" && (
                        <input
                            type="email"
                            required={field.required}
                            value={answers[field.id] || ""}
                            onChange={e => handleChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500 transition-colors"
                        />
                    )}
                    {field.type === "PHONE" && (
                        <input
                            type="tel"
                            required={field.required}
                            value={answers[field.id] || ""}
                            onChange={e => handleChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500 transition-colors"
                        />
                    )}
                    {field.type === "SELECT" && (
                        <select
                            required={field.required}
                            value={answers[field.id] || ""}
                            onChange={e => handleChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 outline-none border border-transparent focus:border-rose-500 transition-colors"
                        >
                            <option value="">Seçiniz...</option>
                            {(field.options || "").split(",").map(opt => opt.trim()).filter(Boolean).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    {field.type === "CHECKBOX" && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!answers[field.id]}
                                onChange={e => handleChange(field.id, e.target.checked)}
                                className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500"
                            />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">Evet</span>
                        </label>
                    )}
                </div>
            ))}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
                {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>
        </form>
    );
}

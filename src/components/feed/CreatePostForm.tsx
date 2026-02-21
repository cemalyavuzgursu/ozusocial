/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
 
"use client";

import { useState, useRef } from "react";
import { createPost } from "@/app/actions/post";

export default function CreatePostForm({ userProfileImage }: { userProfileImage?: string | null }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            const objectUrl = URL.createObjectURL(file);
            setMediaPreview(objectUrl);
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            if (mediaFile) {
                const uploadData = new FormData();
                uploadData.append("file", mediaFile);
                uploadData.append("type", "post-media");

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Medya yüklenemedi.");
                }

                const data = await res.json();
                if (mediaFile.type.startsWith("video/")) {
                    formData.append("videoUrl", data.url);
                } else {
                    formData.append("imageUrl", data.url);
                }
            }

            await createPost(formData);

            formRef.current?.reset();
            handleRemoveMedia();
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm mb-8 transition-shadow hover:shadow-md">
            <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden ring-2 ring-white dark:ring-neutral-900">
                        {userProfileImage ? (
                            <img src={userProfileImage} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <textarea
                            name="content"
                            placeholder="Kampüste neler oluyor? Paylaş!"
                            className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 text-lg resize-none outline-none border-b border-transparent focus:border-rose-500 transition-colors focus:ring-0 min-h-[60px]"
                            maxLength={500}
                        />

                        {mediaPreview && (
                            <div className="relative mt-3 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-black/5 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={handleRemoveMedia}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10 backdrop-blur-md"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                {mediaFile?.type.startsWith('video/') ? (
                                    <video src={mediaPreview} controls className="max-h-64 object-contain w-full" />
                                ) : (
                                     
                                    <img src={mediaPreview} alt="Preview" className="max-h-64 object-contain w-full" />
                                )}
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors flex items-center gap-2 font-medium text-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Medya Ekle
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || (!mediaFile && !formRef.current?.content?.value)}
                        className="group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isSubmitting ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        ) : (
                            <span>Gönder</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

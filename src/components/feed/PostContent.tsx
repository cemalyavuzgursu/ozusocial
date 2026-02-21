"use client";

import { useState } from "react";
import { deletePost, editPost } from "@/app/actions/post";

interface PostContentProps {
    postId: string;
    initialContent: string;
    isOwner: boolean;
}

export default function PostContent({ postId, initialContent, isOwner }: PostContentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        setIsSubmitting(true);
        await editPost(postId, content);
        setIsEditing(false);
        setIsSubmitting(false);
    };

    const handleDelete = async () => {
        if (confirm("Gönderiyi silmek istediğinizden emin misiniz?")) {
            setIsDeleting(true);
            await deletePost(postId);
        }
    };

    return (
        <div className="w-full">
            {isEditing ? (
                <div className="flex flex-col gap-2 mt-1 mb-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                        rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => { setIsEditing(false); setContent(initialContent); }} className="px-3 py-1.5 text-xs text-neutral-500 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg">İptal</button>
                        <button onClick={handleSave} disabled={isSubmitting} className="px-4 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors">
                            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words leading-relaxed text-[15px]">
                    {initialContent}
                </p>
            )}

            {isOwner && !isEditing && (
                <div className="flex gap-3 mt-3 items-center">
                    <button onClick={() => setIsEditing(true)} className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium transition-colors">Düzenle</button>
                    <button onClick={handleDelete} disabled={isDeleting} className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors">
                        {isDeleting ? "Siliniyor..." : "Sil"}
                    </button>
                </div>
            )}
        </div>
    );
}

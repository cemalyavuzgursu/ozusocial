
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toggleLike, addComment, toggleCommentLike, editComment, deleteComment, getPostStats } from "@/app/actions/interaction";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface InteractionButtonsProps {
    postId: string;
    initialLikeCount: number;
    initialHasLiked: boolean;
    initialComments: any[];
    currentUserId?: string;
}

export default function InteractionButtons({ postId, initialLikeCount, initialHasLiked, initialComments, currentUserId }: InteractionButtonsProps) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [hasLiked, setHasLiked] = useState(initialHasLiked);
    const [isLiking, setIsLiking] = useState(false);

    const [showComments, setShowComments] = useState(false);

    // Yorum theadına kendi like sayılarımızı ve beğeni durumumuzu ekliyoruz
    const [comments, setComments] = useState(() => {
        return initialComments.map(c => ({
            ...c,
            _count: c._count || { likes: 0 },
            hasLiked: c.likes ? c.likes.some((l: any) => l.userId === currentUserId) : false
        }));
    });

    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    const fetchStats = useCallback(async () => {
        try {
            const stats = await getPostStats(postId);
            if (!stats) return;

            // Update Post Likes if we are not actively toggling
            if (!isLiking) {
                setLikeCount(stats.likeCount);
                setHasLiked(stats.hasLiked);
            }

            // Update Comment Likes and sync
            setComments(prev => prev.map(c => {
                if (c.isOptimistic) return c; // Don't override sending comments
                const serverStat = stats.comments.find(sc => sc.id === c.id);
                if (serverStat) {
                    return {
                        ...c,
                        hasLiked: serverStat.hasLiked,
                        _count: { ...c._count, likes: serverStat.likeCount }
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("Stats fetching error", error);
        }
    }, [postId, isLiking]);

    useEffect(() => {
        const intervalId = setInterval(fetchStats, 5000);
        return () => clearInterval(intervalId);
    }, [fetchStats]);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        const newHasLiked = !hasLiked;
        setHasLiked(newHasLiked);
        setLikeCount(prev => newHasLiked ? prev + 1 : prev - 1);

        try {
            await toggleLike(postId);
        } catch {
            // Revert optimistically on error
            setHasLiked(!newHasLiked);
            setLikeCount(prev => !newHasLiked ? prev + 1 : prev - 1);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        const tempComment = {
            id: `temp-${Date.now()}`,
            content: commentText.trim(),
            createdAt: new Date(),
            user: { name: "Sen" },
            isOptimistic: true
        };

        setComments(prev => [...prev, tempComment]);
        setCommentText("");

        try {
            const newComment = await addComment(postId, tempComment.content);
            if (newComment) {
                setComments(prev => prev.map(c =>
                    c.id === tempComment.id
                        ? { ...newComment, _count: { likes: 0 }, hasLiked: false }
                        : c
                ));
            }
        } catch {
            setComments(prev => prev.filter(c => c.id !== tempComment.id));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentLike = async (commentId: string) => {
        if (commentId.startsWith("temp-")) return; // Optimistic yorumlar DB'ye gidene kadar beğenilemez

        // State üzerinde optimistic değişim yap
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const newHasLiked = !c.hasLiked;
                return {
                    ...c,
                    hasLiked: newHasLiked,
                    _count: { likes: newHasLiked ? c._count.likes + 1 : c._count.likes - 1 }
                };
            }
            return c;
        }));

        try {
            await toggleCommentLike(commentId);
        } catch {
            // Revert on error
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    const newHasLiked = !c.hasLiked; // revert
                    return {
                        ...c,
                        hasLiked: newHasLiked,
                        _count: { likes: newHasLiked ? c._count.likes + 1 : c._count.likes - 1 }
                    };
                }
                return c;
            }));
        }
    };

    const handleEditClick = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.content);
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editCommentText.trim()) return;

        // Optimistic update
        setComments(prev => prev.map(c =>
            c.id === commentId ? { ...c, content: editCommentText.trim() } : c
        ));
        setEditingCommentId(null);

        try {
            await editComment(commentId, editCommentText.trim());
        } catch {
            // Can be reverted if necessary
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

        // Optimistic delete
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            await deleteComment(commentId);
        } catch {
            // Can be reverted if necessary
        }
    };

    return (
        <div className="w-full">
            <div className="border-t border-neutral-100 dark:border-neutral-800/50 mt-4 pt-4 flex items-center gap-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors group ${hasLiked ? 'text-rose-500' : 'text-neutral-500 hover:text-rose-500'}`}
                >
                    <div className={`p-2 rounded-full transition-colors ${hasLiked ? 'bg-rose-50 dark:bg-rose-500/10' : 'group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10'}`}>
                        <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium">{likeCount} Beğeni</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-blue-500' : 'text-neutral-500 hover:text-blue-500'}`}
                >
                    <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-blue-50 dark:bg-blue-500/10' : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium">{comments.length} Yorum</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto pr-2">
                        {comments.length === 0 ? (
                            <p className="text-center text-xs text-neutral-400 py-2">İlk yorumu sen yap!</p>
                        ) : (
                            comments.map((comment: any) => (
                                <div key={comment.id} className={`bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-4 flex flex-col gap-2 ${comment.isOptimistic ? 'opacity-75' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                                                {comment.user.name}
                                            </span>
                                            {currentUserId && comment.userId === currentUserId && !comment.isOptimistic && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditClick(comment)} className="text-[10px] text-blue-500 hover:underline">Düzenle</button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-rose-500 hover:underline">Sil</button>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-neutral-400">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                                        </span>
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="flex flex-col gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setEditingCommentId(null)} className="text-xs text-neutral-500 px-2 py-1">İptal</button>
                                                <button onClick={() => handleUpdateComment(comment.id)} className="text-xs bg-blue-500 text-white rounded-md px-3 py-1 font-medium">Kaydet</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-neutral-800 dark:text-neutral-200 break-words">
                                            {comment.content}
                                        </p>
                                    )}

                                    {/* Yorum Beğenme Butonu */}
                                    {!comment.isOptimistic && editingCommentId !== comment.id && (
                                        <div className="flex justify-end mt-1">
                                            <button
                                                onClick={() => handleCommentLike(comment.id)}
                                                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${comment.hasLiked ? 'text-rose-500' : 'text-neutral-500 hover:text-rose-500'}`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill={comment.hasLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span>{comment._count.likes > 0 ? comment._count.likes : "Beğen"}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Bir yorum yaz..."
                            className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 text-neutral-900 dark:text-neutral-100"
                            maxLength={200}
                        />
                        <button type="submit" disabled={isSubmittingComment || !commentText.trim()} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
                            Gönder
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PostContent from "./PostContent";
import InteractionButtons from "./InteractionButtons";
import ClubBadge from "@/components/ui/ClubBadge";
import PostActionsMenu from "@/components/ui/PostActionsMenu";

interface PostListProps {
    feedType?: 'all' | 'following';
}

export default async function PostList({ feedType = 'all' }: PostListProps) {
    const session = await getServerSession(authOptions);

    let currentUserObj = null;
    if (session?.user?.email) {
        currentUserObj = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, universityDomain: true }
        });
    }

    let whereClause: any = {};

    if (feedType === 'all' && currentUserObj?.universityDomain) {
        whereClause = {
            author: {
                universityDomain: currentUserObj.universityDomain,
                isPrivate: false
            }
        };
    }

    if (feedType === 'following' && session?.user?.email) {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { following: { select: { id: true } } }
        });


        const followingIds = currentUser?.following.map((user: any) => user.id) || [];

        if (followingIds.length > 0) {
            whereClause = { authorId: { in: followingIds } };
        } else {
            // Takip ettiği kimse yoksa boş dönsün diye imkansız bir koşul
            whereClause = { authorId: 'nobody' };
        }
    }

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        where: whereClause,
        include: {
            author: { select: { name: true, image: true, id: true, role: true } },
            likes: { select: { userId: true } },
            comments: {
                orderBy: { createdAt: "asc" },
                include: {
                    user: { select: { name: true, image: true, id: true } },
                    likes: { select: { userId: true } },
                    _count: { select: { likes: true } }
                }
            },
            _count: { select: { likes: true, comments: true } }
        },
    });

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                <p className="text-lg">Burada henüz bir şey yok.</p>
                {feedType === 'following' && <p className="text-sm mt-2">Daha fazla öğrenciyi takip ederek akışını hareketlendir!</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">

            {posts.map((post: any) => (
                <article
                    key={post.id}
                    className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <Link href={`/user/${post.author.id}`} className="block relative w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 hover:border-rose-400 dark:hover:border-rose-500 transition-colors group">
                                {post.author.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.author.image} alt={post.author.name || "Kullanıcı"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-500 group-hover:text-rose-500 transition-colors">
                                        {post.author.name?.charAt(0)}
                                    </div>
                                )}
                            </Link>
                            <div>
                                <Link href={`/user/${post.author.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                    {post.author.name}
                                    {post.author.role === "CLUB" && <ClubBadge />}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <time className="text-xs text-neutral-400 font-medium">
                                {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: tr })}
                            </time>
                            <PostActionsMenu postId={post.id} isOwner={post.author.email === session?.user?.email} />
                        </div>
                    </div>

                    <div className="pl-[52px]">
                        {post.imageUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={post.imageUrl} alt="" className="w-full max-h-[500px] object-contain rounded-2xl mb-4 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800" />
                        )}
                        {post.videoUrl && (
                            <video
                                src={post.videoUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full max-h-[500px] rounded-2xl mb-4 border border-neutral-200 dark:border-neutral-800 bg-black"
                            />
                        )}

                        <PostContent
                            postId={post.id}
                            initialContent={post.content || ""}
                            isOwner={post.author.email === session?.user?.email}
                        />

                        <InteractionButtons
                            postId={post.id}
                            initialLikeCount={post._count.likes}
                            initialHasLiked={post.likes.some((l: any) => session?.user?.email && l.userId === currentUserObj?.id)}
                            initialComments={post.comments}
                            currentUserId={currentUserObj?.id}
                        />
                    </div>


                </article>
            ))}
        </div>
    );
}

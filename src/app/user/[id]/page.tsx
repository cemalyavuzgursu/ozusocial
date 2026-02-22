/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import FollowButton from "@/components/profile/FollowButton";
import Link from "next/link";
import PostContent from "@/components/feed/PostContent";
import { getAdminSession } from "@/lib/auth";
import { getUniversityFromEmail } from "@/lib/university";
import ClubBadge from "@/components/ui/ClubBadge";
import UserActionsMenu from "@/components/ui/UserActionsMenu";

export const dynamic = "force-dynamic";

export default async function UserProfilePage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const adminSession = await getAdminSession();
    const session = await getServerSession(authOptions);

    // Yalnızca normal kullanıcı ve adminlerin ikisi de yoksa ana sayfaya at
    if ((!session || !session.user?.email) && !adminSession?.username) {
        redirect("/");
    }

    // Current session user mapping
    const currentUser = session?.user?.email ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, following: { select: { id: true } } }
    }) : null;

    // If the user is trying to view their own profile via this URL, redirect to /profile
    if (currentUser?.id === params.id) {
        redirect("/profile");
    }

    // Get Target user details and their posts
    const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
            posts: {
                orderBy: { createdAt: "desc" },
                include: { author: { select: { name: true, image: true, id: true, role: true } } }
            },
            _count: {
                select: { followedBy: true, following: true }
            }
        }
    });

    if (!targetUser) {
        // Profil bulunamadıysa ana akışa at
        redirect("/feed");
    }

    const isFollowing = currentUser?.following.some((user: any) => user.id === params.id) || false;
    let initialStatus: "FOLLOWING" | "PENDING" | "UNFOLLOWED" = isFollowing ? "FOLLOWING" : "UNFOLLOWED";

    if (!isFollowing && targetUser.isPrivate && currentUser?.id) {
        const pendingReq = await prisma.followRequest.findUnique({
            where: { senderId_receiverId: { senderId: currentUser.id, receiverId: params.id } }
        });
        if (pendingReq) {
            initialStatus = "PENDING";
        }
    }
    const isAdminView = !!adminSession?.username;
    const canSeePosts = !targetUser.isPrivate || isFollowing || isAdminView;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">
            <Navbar />

            <main className="max-w-3xl mx-auto flex flex-col gap-8">

                {/* Profile Card */}
                <section className="bg-white dark:bg-neutral-900 rounded-3xl p-8 pb-10 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">

                    <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 overflow-hidden">
                        {targetUser.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={targetUser.coverImage} alt="Banner" className="w-full h-full object-cover opacity-90" />
                        )}
                    </div>

                    <div className="relative flex justify-between items-end mt-12 mb-4 sm:px-2">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-900 bg-neutral-200 overflow-hidden shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {targetUser.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={targetUser.image} alt={targetUser.name || "Profil"} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-4xl font-bold text-neutral-500">
                                    {targetUser.name?.charAt(0) || targetUser.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="mb-2 flex items-center gap-2 z-10">
                            <UserActionsMenu userId={targetUser.id} />
                            <FollowButton targetUserId={targetUser.id} initialStatus={initialStatus} />
                        </div>
                    </div>

                    <div className="relative sm:px-2 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1 tracking-tight flex items-center gap-2">
                            {targetUser.name}
                            {targetUser.role === "CLUB" && <ClubBadge />}
                        </h1>
                        <p className="text-neutral-500 font-medium mb-4">@{targetUser.email?.split("@")[0]}</p>

                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {targetUser.role === "CLUB" ? "Öğrenci Kulübü" : "Öğrenci"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                🎓 {getUniversityFromEmail(targetUser.email)}
                            </span>
                            {targetUser.showDepartment && targetUser.department && (
                                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                    🏫 {targetUser.department}
                                </span>
                            )}
                            {targetUser.showBirthYear && targetUser.birthYear && (
                                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                    🎈 {new Date().getFullYear() - targetUser.birthYear} Yaşında
                                </span>
                            )}
                        </div>
                        {targetUser.bio && (
                            <div className="mt-4 max-w-xl mx-auto sm:mx-0 text-center sm:text-left text-neutral-600 dark:text-neutral-400 text-sm whitespace-pre-wrap leading-relaxed">
                                {targetUser.bio}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex gap-10 justify-center sm:justify-start">
                        <div className="text-center sm:text-left cursor-pointer group">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">{targetUser.posts.length}</p>
                            <p className="text-sm text-neutral-500 font-medium">Gönderi</p>
                        </div>
                        <div className="text-center sm:text-left cursor-pointer group">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">{targetUser._count.followedBy}</p>
                            <p className="text-sm text-neutral-500 font-medium">Takipçi</p>
                        </div>
                        <div className="text-center sm:text-left cursor-pointer group">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">{targetUser._count.following}</p>
                            <p className="text-sm text-neutral-500 font-medium">Takip Edilen</p>
                        </div>
                    </div>
                </section>

                {/* User Posts list */}
                <div>
                    <h2 className="text-xl font-bold px-2 mb-4 text-neutral-800 dark:text-neutral-200">{targetUser.name?.split(' ')[0]} adlı kişinin Gönderileri</h2>

                    {!canSeePosts ? (
                        <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Bu Hesap Gizli</h3>
                            <p className="text-sm">Fotoğraf ve videolarını görmek için bu hesabı takip et.</p>
                        </div>
                    ) : targetUser.posts.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                            <p className="text-lg">Kullanıcı henüz içerik paylaşmamış.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            { }
                            {targetUser.posts.map((post: any) => (
                                <article
                                    key={post.id}
                                    className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/user/${post.author.id}`} className="block relative w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 hover:border-rose-400 transition-colors">
                                                {post.author.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={post.author.image} alt={post.author.name || "Kullanıcı"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-500">
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
                                        <time className="text-xs text-neutral-400 font-medium">
                                            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: tr })}
                                        </time>
                                    </div>
                                    <div className="pl-[52px]">
                                        {post.imageUrl && (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={post.imageUrl} alt="Post image" className="w-full max-h-96 object-cover rounded-2xl mb-4 border border-neutral-200 dark:border-neutral-800" />
                                        )}
                                        {post.videoUrl && (
                                            <video src={post.videoUrl} controls className="w-full max-h-96 object-cover rounded-2xl mb-4 border border-neutral-200 dark:border-neutral-800" />
                                        )}

                                        <PostContent
                                            postId={post.id}
                                            initialContent={post.content || ""}
                                            isOwner={post.author.email === session?.user?.email}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

            </main >
        </div >
    );
}

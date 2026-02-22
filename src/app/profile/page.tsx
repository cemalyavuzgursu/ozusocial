/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import ProfileActions from "@/components/profile/ProfileActions";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import PostContent from "@/components/feed/PostContent";
import { getUniversityFromEmail } from "@/lib/university";
import ClubBadge from "@/components/ui/ClubBadge";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect("/");
    }

    // Get user details and their posts
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            posts: {
                orderBy: { createdAt: "desc" }
            },
            _count: {
                select: { followedBy: true, following: true }
            }
        }
    });

    if (!user) {
        redirect("/");
    }

    if (user.isBanned) redirect("/auth/error?error=Banned");
    if (!user.isOnboarded) redirect("/onboarding");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">

            <Navbar />

            <main className="max-w-3xl mx-auto flex flex-col gap-8">

                {/* Profile Card */}
                <section className="bg-white dark:bg-neutral-900 rounded-3xl p-8 pb-10 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">

                    {/* Banner Görseli */}
                    <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 overflow-hidden">
                        {user.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.coverImage} alt="Banner" className="w-full h-full object-cover opacity-90" />
                        )}
                    </div>

                    <div className="relative flex justify-between items-end mt-12 mb-4 sm:px-2">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-900 bg-neutral-200 overflow-hidden shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.image} alt={user.name || "Profil"} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-4xl font-bold text-neutral-500">
                                    {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            <ProfileActions
                                user={{
                                    name: user.name,
                                    image: user.image,
                                    coverImage: user.coverImage,
                                    isPrivate: user.isPrivate,
                                    showProfileDetails: user.showProfileDetails,
                                    department: user.department,
                                    birthYear: user.birthYear,
                                    showDepartment: user.showDepartment,
                                    showBirthYear: user.showBirthYear
                                }}
                                isOwnProfile={true}
                            />
                        </div>
                    </div>

                    <div className="relative sm:px-2 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1 tracking-tight flex items-center gap-2">
                            {user.name}
                            {user.role === "CLUB" && <ClubBadge />}
                        </h1>
                        <p className="text-neutral-500 font-medium mb-4">@{user.email?.split("@")[0]}</p>

                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {user.role === "CLUB" ? "Öğrenci Kulübü" : "Öğrenci"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                🎓 {getUniversityFromEmail(user.email)}
                            </span>
                            {user.showDepartment && user.department && (
                                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                    🏫 {user.department}
                                </span>
                            )}
                            {user.showBirthYear && user.birthYear && (
                                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                    🎈 {new Date().getFullYear() - user.birthYear} Yaşında
                                </span>
                            )}
                        </div>
                        {user.bio && (
                            <div className="mt-4 max-w-xl mx-auto sm:mx-0 text-center sm:text-left text-neutral-600 dark:text-neutral-400 text-sm whitespace-pre-wrap leading-relaxed">
                                {user.bio}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex gap-10 justify-center sm:justify-start">
                        <div className="text-center sm:text-left cursor-pointer group">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">{user.posts.length}</p>
                            <p className="text-sm text-neutral-500 font-medium">Gönderi</p>
                        </div>
                        <div className="text-center sm:text-left cursor-pointer group">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">{user._count.followedBy}</p>
                            <p className="text-sm text-neutral-500 font-medium">Takipçi</p>
                        </div>
                        <div className="text-center sm:text-left cursor-pointer group">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">{user._count.following}</p>
                            <p className="text-sm text-neutral-500 font-medium">Takip Edilen</p>
                        </div>
                    </div>
                </section>

                {/* User Posts list */}
                <div>
                    <h2 className="text-xl font-bold px-2 mb-4 text-neutral-800 dark:text-neutral-200">Gönderilerim</h2>

                    {user.posts.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                            <p className="text-lg mb-2">Henüz içerik paylaşmadın.</p>
                            <p className="text-sm">Akışa gidip ilk gönderini oluşturabilirsin!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {user.posts.map((post: any) => (
                                <article
                                    key={post.id}
                                    className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-sm font-semibold text-rose-500 flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Gönderi
                                        </span>
                                        <time className="text-xs text-neutral-400 font-medium">
                                            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: tr })}
                                        </time>
                                    </div>

                                    <div>
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
                                            isOwner={true}
                                        />
                                    </div>

                                    <div className="border-t border-neutral-100 dark:border-neutral-800/50 mt-4 pt-4 flex items-center justify-end">
                                        <span className="text-xs text-neutral-300 dark:text-neutral-700">Düzenleme kontrolleri yukarıdadır</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

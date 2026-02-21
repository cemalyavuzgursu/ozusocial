/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import FollowButton from "@/components/profile/FollowButton";

export const dynamic = "force-dynamic";

export default async function SearchPage(
    props: { searchParams: Promise<{ q?: string }> }
) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect("/");
    }

    const query = searchParams?.q || "";

    // Get current session user to check follow status
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, following: { select: { id: true } } }
    });

    // Search for users by name or email

    let searchResults: any[] = [];
    if (query.trim().length > 0) {
        searchResults = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query } },  // SQLite'ta contains varsayılan olarak büyük/küçük harf duyarsızdır.
                    { email: { contains: query } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
            take: 20 // Limit results
        });
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">
            <Navbar />

            <main className="max-w-3xl mx-auto flex flex-col gap-6">

                <header className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-indigo-600">
                        Arama Sonuçları
                    </h1>
                    <p className="text-neutral-500 mt-1">&quot;{query}&quot; için arama yapıldı</p>
                </header>

                <section className="flex flex-col gap-4">
                    {searchResults.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                            <p className="text-lg">Kullanıcı bulunamadı.</p>
                            <p className="text-sm">Farklı bir isim veya mail ile tekrar dene.</p>
                        </div>
                    ) : (
                        searchResults.map((user: any) => {
                            const isFollowing = currentUser?.following.some((f: any) => f.id === user.id) || false;

                            return (
                                <div
                                    key={user.id}
                                    className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <Link href={`/user/${user.id}`} className="block relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 group">
                                            {user.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-neutral-500 group-hover:text-rose-500 transition-colors">
                                                    {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </Link>

                                        <div>
                                            <Link href={`/user/${user.id}`} className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                                {user.name}
                                            </Link>
                                            <p className="text-sm text-neutral-500">@{user.email?.split("@")[0]}</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block">
                                        {user.id !== currentUser?.id && (
                                            <FollowButton targetUserId={user.id} initialStatus={isFollowing ? "FOLLOWING" : "UNFOLLOWED"} />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>

            </main>
        </div>
    );
}

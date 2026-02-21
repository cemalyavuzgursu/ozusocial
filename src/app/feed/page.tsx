import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreatePostForm from "@/components/feed/CreatePostForm";
import PostList from "@/components/feed/PostList";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeedPage(
    props: { searchParams: Promise<{ tab?: string }> }
) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { isOnboarded: true, isBanned: true }
    });

    if (!user) redirect("/");
    if (user.isBanned) redirect("/auth/error?error=Banned");
    if (!user.isOnboarded) redirect("/onboarding");

    const currentTab = searchParams?.tab === 'following' ? 'following' : 'all';

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">

            <Navbar />

            <main className="max-w-3xl mx-auto flex flex-col gap-6">

                {/* Gönderi Oluşturma Alanı */}
                <CreatePostForm userProfileImage={session.user?.image} />

                {/* Akış Sekmeleri (Tabs) */}
                <div className="flex items-center gap-2 p-1 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-2xl w-full sm:w-auto self-start mt-2">
                    <Link
                        href="/feed?tab=all"
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${currentTab === 'all' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}
                    >
                        Tümü
                    </Link>
                    <Link
                        href="/feed?tab=following"
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${currentTab === 'following' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}
                    >
                        Takip Ettiklerin
                    </Link>
                </div>

                {/* Gönderi Listesi alanı */}
                <PostList feedType={currentTab} />

            </main>
        </div>
    );
}

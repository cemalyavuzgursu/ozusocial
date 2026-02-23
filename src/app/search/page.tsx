/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import SearchClient from "./SearchClient";

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

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, following: { select: { id: true } } }
    });

    let searchResults: any[] = [];
    if (query.trim().length > 0) {
        searchResults = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
            take: 20
        });
    }

    const followingIds = currentUser?.following.map((f: any) => f.id) ?? [];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-12 text-neutral-900 dark:text-neutral-100">
            <Navbar />
            <SearchClient
                initialQuery={query}
                initialResults={searchResults}
                currentUserId={currentUser?.id}
                initialFollowingIds={followingIds}
            />
        </div>
    );
}

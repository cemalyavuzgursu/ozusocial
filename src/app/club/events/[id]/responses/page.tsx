/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function FormResponsesPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });
    if (!user || user.role !== "CLUB") redirect("/feed");

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
            form: {
                include: {
                    fields: { orderBy: { order: "asc" } },
                    responses: { orderBy: { createdAt: "desc" } }
                }
            }
        }
    });
    if (!event || event.authorId !== user.id) redirect("/club");
    if (!event.form) redirect("/club");

    const { fields, responses } = event.form;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-16">
            <Navbar />
            <main className="max-w-4xl mx-auto pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/club" className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Form Cevapları</h1>
                        <p className="text-sm text-neutral-500">{event.title} · {responses.length} kayıt</p>
                    </div>
                </div>

                {responses.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-500">
                        <p className="text-lg">Henüz kayıt yok.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {responses.map((response: any, i: number) => (
                            <div key={response.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                        #{responses.length - i} — {response.userName || "İsimsiz"}
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        {format(new Date(response.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {fields.map((field: any) => {
                                        const answers = response.answers as Record<string, any>;
                                        const answer = answers[field.id];
                                        return (
                                            <div key={field.id} className="flex gap-3 text-sm">
                                                <span className="text-neutral-500 flex-shrink-0 w-40 truncate">{field.label}:</span>
                                                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                    {Array.isArray(answer) ? answer.join(", ") : (answer?.toString() || "—")}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

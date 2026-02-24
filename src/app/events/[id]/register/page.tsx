import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import RegisterFormClient from "./RegisterFormClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!currentUser) redirect("/");

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
            form: { include: { fields: { orderBy: { order: "asc" } } } }
        }
    });

    if (!event) notFound();
    if (!event.form) redirect(`/events/${params.id}`);

    // Daha önce kayıt yaptırdı mı?
    const alreadySubmitted = await prisma.formResponse.findFirst({
        where: { formId: event.form.id, userId: currentUser.id }
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-16">
            <Navbar />
            <main className="max-w-xl mx-auto pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={`/events/${params.id}`} className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Etkinliğe Kayıt Ol</h1>
                        <p className="text-sm text-neutral-500">{event.title}</p>
                    </div>
                </div>

                {alreadySubmitted ? (
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
                        <div className="text-4xl mb-3">✓</div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Zaten Kayıt Yaptırdınız</h2>
                        <p className="text-neutral-500 mb-6">Bu etkinliğe daha önce başvurdunuz.</p>
                        <Link href={`/events/${params.id}`} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
                            Etkinliğe Dön
                        </Link>
                    </div>
                ) : (
                    <RegisterFormClient
                        formId={event.form.id}
                        eventId={params.id}
                        fields={event.form.fields.map(f => ({
                            id: f.id,
                            label: f.label,
                            type: f.type,
                            options: f.options,
                            required: f.required
                        }))}
                    />
                )}
            </main>
        </div>
    );
}

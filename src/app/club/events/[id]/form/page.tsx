import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import FormBuilderClient from "./FormBuilderClient";

export const dynamic = "force-dynamic";

export default async function FormBuilderPage(props: { params: Promise<{ id: string }> }) {
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
        include: { form: { include: { fields: { orderBy: { order: "asc" } } } } }
    });
    if (!event || event.authorId !== user.id) redirect("/club");

    const initialFields = event.form?.fields.map(f => ({
        id: f.id,
        label: f.label,
        type: f.type,
        options: f.options || "",
        required: f.required,
        order: f.order
    })) || [];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pb-16">
            <Navbar />
            <main className="max-w-2xl mx-auto pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/club" className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Kayıt Formunu Düzenle</h1>
                        <p className="text-sm text-neutral-500">Öğrencilerin dolduracağı alanları belirle</p>
                    </div>
                </div>

                <FormBuilderClient
                    eventId={params.id}
                    eventTitle={event.title}
                    initialFields={initialFields}
                />
            </main>
        </div>
    );
}

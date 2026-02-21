import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboard";

export default async function OnboardingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { isOnboarded: true, isBanned: true }
    });

    if (!user) redirect("/");
    if (user.isBanned) redirect("/auth/error?error=Banned");
    if (user.isOnboarded) redirect("/feed");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">ÖzüSocial'a Hoş Geldin! 👋</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Seni daha yakından tanıyabilmemiz için profilini tamamla.</p>
                </div>

                <form action={completeOnboarding} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Bölüm / Fakülte <span className="text-rose-500">*</span></label>
                        <input required type="text" name="department" placeholder="Örn: Bilgisayar Mühendisliği" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Doğum Yılı <span className="text-rose-500">*</span></label>
                        <input required type="number" name="birthYear" min="1900" max={new Date().getFullYear()} placeholder="Örn: 2002" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                    </div>

                    <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-8">
                        Profili Tamamla ve Başla
                    </button>
                </form>
            </div>
        </div>
    );
}

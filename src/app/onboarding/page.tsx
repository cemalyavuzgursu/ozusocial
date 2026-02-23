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
        select: {
            isOnboarded: true,
            isBanned: true,
            university: {
                select: { departments: true }
            }
        }
    });

    if (!user) redirect("/");
    if (user.isBanned) redirect("/auth/error?error=Banned");
    if (user.isOnboarded) redirect("/feed");

    const validDepartments = user.university?.departments
        ? user.university.departments.split(',').map(d => d.trim()).filter(Boolean)
        : [];

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
                        {validDepartments.length > 0 ? (
                            <div className="relative">
                                <select
                                    required
                                    name="department"
                                    className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 appearance-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Lütfen bölümünüzü seçin...</option>
                                    {validDepartments.map((dep: string, i: number) => (
                                        <option key={i} value={dep}>{dep}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    required
                                    disabled
                                    name="department"
                                    className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none rounded-xl px-4 py-3 text-sm text-rose-500 opacity-80 appearance-none cursor-not-allowed"
                                >
                                    <option value="">Üniversiteniz için henüz bölüm eklenmemiş.</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-rose-500 opacity-50">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Doğum Yılı <span className="text-rose-500">*</span></label>
                        <input required type="number" name="birthYear" min="1900" max={new Date().getFullYear()} placeholder="Örn: 2002" className="w-full bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100" />
                    </div>

                    <button
                        type="submit"
                        disabled={validDepartments.length === 0}
                        className={`w-full font-bold py-3 rounded-xl transition-all shadow-md mt-8 ${validDepartments.length === 0 ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-lg hover:-translate-y-0.5'}`}
                    >
                        {validDepartments.length === 0 ? "Bölüm bekleniyor..." : "Profili Tamamla ve Başla"}
                    </button>
                </form>
            </div>
        </div>
    );
}

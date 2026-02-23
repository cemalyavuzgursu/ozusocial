import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            image: true,
            coverImage: true,
            isPrivate: true,
            showProfileDetails: true,
            department: true,
            birthYear: true,
            showDepartment: true,
            showBirthYear: true,
            role: true,
            isOnboarded: true,
            bio: true,
            university: { select: { departments: true } }
        }
    });

    if (!user) redirect("/");
    if (!user.isOnboarded) redirect("/onboarding");

    const universityDepartments = user.university?.departments
        ? user.university.departments.split(',').map((d: string) => d.trim()).filter(Boolean)
        : [];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6">
            <Navbar />

            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                        Profil Ayarları
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                        Kişisel bilgilerinizi, eğitim detaylarınızı ve hesabınızın gizlilik seçeneklerini buradan yönetebilirsiniz.
                    </p>

                    <SettingsForm user={user} universityDepartments={universityDepartments} />
                </div>
            </div>
        </div>
    );
}

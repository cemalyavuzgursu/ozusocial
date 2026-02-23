import { getUniversityById } from "@/app/actions/admin";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UniversityDetail from "./UniversityDetail"; // Client component

export default async function UniversityPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        redirect("/admin/login");
    }

    try {
        const { university, users } = await getUniversityById(params.id);

        return (
            <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <UniversityDetail initialUniversity={university} initialUsers={users} />
                </div>
            </div>
        );
    } catch (e) {
        return (
            <div className="max-w-6xl mx-auto p-8 text-center text-rose-500">
                <p>Üniversite bulunamadı veya bir hata oluştu.</p>
            </div>
        );
    }
}

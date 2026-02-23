import { getUniversityById } from "@/app/actions/admin";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UniversityDetail from "./UniversityDetail"; // Client component

export default async function UniversityPage({ params }: { params: { id: string } }) {
    const adminSession = await getAdminSession();
    if (!adminSession?.username) {
        redirect("/admin/login");
    }

    try {
        const { university, users } = await getUniversityById(params.id);

        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <UniversityDetail initialUniversity={university} initialUsers={users} />
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

"use server";

import { cookies } from "next/headers";
import { createAdminToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Müşterinin talebine istinaden, Oauth olmadan "admin" / "1234" hardcoded girişi
    if (username === "admin" && password === "1234") {
        const { token, expires } = await createAdminToken(username);

        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            expires: expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/admin",
        });

        redirect("/admin");
    } else {
        return { error: "Geçersiz Kullanıcı Adı veya Şifre" };
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    redirect("/admin/login");
}

"use server";

import { cookies } from "next/headers";
import { createAdminToken } from "@/lib/auth";
import { redirect } from "next/navigation";

// --- Brute-force koruması (in-memory, VULN-14) ---
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 20;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 dakika

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = loginAttempts.get(ip);
    if (!record || now > record.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_MS });
        return true;
    }
    if (record.count >= MAX_ATTEMPTS) return false;
    record.count++;
    return true;
}

function resetAttempts(ip: string) {
    loginAttempts.delete(ip);
}
// -------------------------------------------------

export async function loginAdmin(formData: FormData) {
    const ip = "server";
    if (!checkRateLimit(ip)) {
        return { error: "Çok fazla başarısız giriş denemesi. Lütfen 5 dakika bekleyin." };
    }

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // VULN-1: Kimlik bilgileri .env'den okunuyor
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD; // Düz metin şifre ($ işareti sorunu yok)

    if (!adminUsername || !adminPassword) {
        console.error("ADMIN_USERNAME veya ADMIN_PASSWORD env değişkeni tanımlı değil!");
        return { error: "Sunucu yapılandırma hatası." };
    }

    const usernameMatch = username === adminUsername;
    const passwordMatch = usernameMatch && password === adminPassword;

    if (usernameMatch && passwordMatch) {
        resetAttempts(ip);
        const { token, expires } = await createAdminToken(username);

        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            expires: expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
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

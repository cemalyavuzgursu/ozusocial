import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const rawSecret = process.env.NEXTAUTH_SECRET;
if (!rawSecret) {
    throw new Error("NEXTAUTH_SECRET ortam değişkeni tanımlı değil! Uygulamayı başlatmadan önce .env.local dosyasına ekleyin.");
}
const secretKey = rawSecret;
const key = new TextEncoder().encode(secretKey);

export async function createAdminToken(username: string) {
    // 1 haftalık admin login session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token = await new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);

    return { token, expires };
}

export async function verifyAdminToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch {
        return null;
    }
}

export async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
}

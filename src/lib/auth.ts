import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.NEXTAUTH_SECRET || "default_admin_secret_fallback";
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

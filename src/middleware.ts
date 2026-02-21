/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    // Yalnızca /admin ile başlayan istekleri yakala, ancak /admin/login'i hariç tut
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const secretKey = process.env.NEXTAUTH_SECRET || "default_admin_secret_fallback";
            const key = new TextEncoder().encode(secretKey);

            // Token doğrulamasını burada kenar işlevinde (edge runtime) yap
            await jwtVerify(token, key, {
                algorithms: ['HS256'],
            });
            // Token geçerliyse devam
            return NextResponse.next();
        } catch (e) {
            // Hatalı token ise logine dön
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Sadece admin sayfalarında middleware çalışsın
    matcher: ['/admin/:path*'],
};

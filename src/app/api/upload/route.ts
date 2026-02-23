import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./../auth/[...nextauth]/route";
import { join } from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const type = data.get("type") as string; // 'profile' veya 'banner'

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            return NextResponse.json({ error: "Sadece görsel veya video yüklenebilir" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/");
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // Video 100MB, Resim 10MB

        // Dosya boyutunu sınırla
        if (file.size > maxSize) {
            return NextResponse.json({ error: `Dosya boyutu en fazla ${isVideo ? '100MB' : '10MB'} olabilir` }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // public/uploads klasörünün varlığından emin ol
        const uploadDir = join(process.cwd(), "public/uploads");
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Eşsiz dosya adı oluştur
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = file.name.split('.').pop();
        const filename = `${type}-${uniqueSuffix}.${extension}`;

        // public klasörüne kaydet
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Relative URL döndür — sunucu domain'inden bağımsız çalışır
        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Yükleme sırasında hata oluştu" }, { status: 500 });
    }
}

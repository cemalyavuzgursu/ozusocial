import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./../auth/[...nextauth]/route";
import { join } from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

// VULN-4: MIME → uzantı whitelist (file.name uzantısı güvenilmez)
const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
};

// VULN-4: type parametresi whitelist
const ALLOWED_TYPES = new Set(["profile", "banner", "post"]);

// VULN-14: Rate limiting (in-memory, kullanıcı e-posta bazlı)
const uploadRateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_UPLOADS_PER_MINUTE = 10;

function checkUploadRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = uploadRateLimits.get(identifier);
    if (!record || now > record.resetAt) {
        uploadRateLimits.set(identifier, { count: 1, resetAt: now + 60_000 });
        return true;
    }
    if (record.count >= MAX_UPLOADS_PER_MINUTE) return false;
    record.count++;
    return true;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    // VULN-14: Rate limiting
    if (!checkUploadRateLimit(session.user.email)) {
        return NextResponse.json({ error: "Çok fazla yükleme isteği. Lütfen 1 dakika bekleyin." }, { status: 429 });
    }

    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const type = data.get("type") as string;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        // VULN-4: type parametresi whitelist kontrolü
        const safeType = ALLOWED_TYPES.has(type) ? type : "post";

        // VULN-4: MIME type doğrulaması ve uzantı belirleme
        const extension = ALLOWED_MIME_EXTENSIONS[file.type];
        if (!extension) {
            return NextResponse.json({ error: "Desteklenmeyen dosya türü. İzin verilen: JPEG, PNG, GIF, WebP, MP4, WebM, MOV" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/");
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
            return NextResponse.json({ error: `Dosya boyutu en fazla ${isVideo ? '100MB' : '10MB'} olabilir` }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), "public/uploads");
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // VULN-4: Güvenli dosya adı — safeType whitelist'ten, uzantı MIME'dan
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${safeType}-${uniqueSuffix}.${extension}`;

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${filename}`;
        return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Yükleme sırasında hata oluştu" }, { status: 500 });
    }
}


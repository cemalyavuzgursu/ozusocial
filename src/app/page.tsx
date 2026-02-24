import AuthSection from "@/components/auth/AuthSection";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TypewriterEffect from "@/components/home/TypewriterEffect";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isOnboarded: true, isBanned: true }
    });
    if (user?.isBanned) redirect("/auth/error?error=Banned");
    if (user?.isOnboarded) redirect("/feed");
    else redirect("/onboarding");
  }

  const universities = await prisma.university.findMany({
    select: { domain: true }
  });

  const domains = universities.length > 0 ? universities.map(u => u.domain) : ["edu.tr"];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 pb-20 sm:p-20 relative overflow-hidden bg-white dark:bg-neutral-950">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <main className="flex flex-col items-center gap-8 text-center max-w-3xl z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-medium mb-4 ring-1 ring-inset ring-rose-600/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          Sadece Üniversite Öğrencilerine Özel
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white drop-shadow-sm">
          Kampüsün Yeni <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600">
            Sosyal Ağına
          </span>{" "}
          Katıl.
        </h1>

        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed flex flex-wrap items-center justify-center gap-1">
          Sadece <TypewriterEffect domains={domains} /> e-posta adresinle giriş yap, kampüsteki etkinliklerden haberdar ol, kulüpleri keşfet ve arkadaşlarınla iletişime geç.
        </p>

        <div className="w-full max-w-sm mt-4">
          <AuthSection />
          <Link
            href="/help"
            className="inline-flex items-center justify-center gap-2 mt-4 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            Nasıl Çalışır? →
          </Link>
        </div>

        {/* Feature Highlights Mini */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Sadece Öğrenciler</h3>
            <p className="text-sm text-neutral-500 text-center">Kurumsal e-posta ile giriş — kampüs dışından kimse giremez</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Etkinlikler & Kulüpler</h3>
            <p className="text-sm text-neutral-500 text-center">Kampüs etkinliklerini keşfet, kulüplerin duyurularını takip et</p>
          </div>
          <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Doğrudan Mesajlaşma</h3>
            <p className="text-sm text-neutral-500 text-center">Kampüs arkadaşlarınla birebir özel sohbet et</p>
          </div>
        </div>
        {/* Telefona Yükle */}
        <div className="w-full mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 text-center">
            📱 Telefona Uygulama Gibi Ekle — Ücretsiz!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* iOS */}
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-neutral-700 dark:text-neutral-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="font-bold text-neutral-900 dark:text-white">iPhone / iPad (iOS)</span>
              </div>
              <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2"><span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span><span><strong>Safari</strong> tarayıcısında univibeapp.com.tr açın</span></li>
                <li className="flex items-start gap-2"><span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span><span>Alt ortadaki <strong>Paylaş</strong> butonuna (⬆) basın</span></li>
                <li className="flex items-start gap-2"><span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span><span><strong>&quot;Ana Ekrana Ekle&quot;</strong> seçeneğine basın</span></li>
                <li className="flex items-start gap-2"><span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span><span>Sağ üstten <strong>Ekle</strong>&apos;ye basın — bitti! 🎉</span></li>
              </ol>
            </div>

            {/* Android */}
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M17.523 15.341L19.5 12l-1.977-3.341A9.96 9.96 0 0120 12a9.96 9.96 0 01-2.477 3.341zM6.477 15.341A9.96 9.96 0 014 12a9.96 9.96 0 012.477-3.341L8.5 12l-2.023 3.341zM6.817 5.032L8.964 8.75A4 4 0 0112 8a4 4 0 013.036 8.75l2.147 3.718A10.002 10.002 0 0012 22a10.002 10.002 0 01-5.183-16.968z" fill="#34A853" />
                  <path d="M12 6a4 4 0 100 8 4 4 0 000-8z" fill="#EA4335" />
                </svg>
                <span className="font-bold text-neutral-900 dark:text-white">Android (Chrome)</span>
              </div>
              <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2"><span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span><span><strong>Chrome</strong>&apos;da univibeapp.com.tr açın</span></li>
                <li className="flex items-start gap-2"><span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span><span>Sağ üstteki <strong>⋮ Menü</strong>&apos;ye basın</span></li>
                <li className="flex items-start gap-2"><span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span><span><strong>&quot;Ana ekrana ekle&quot;</strong> seçin</span></li>
                <li className="flex items-start gap-2"><span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span><span><strong>Ekle</strong>&apos;ye basın — bitti! 🎉</span></li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

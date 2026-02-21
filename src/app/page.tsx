import AuthButton from "@/components/auth/AuthButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

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
          Sadece Özyeğinlilere Özel
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white drop-shadow-sm">
          Kampüsün Yeni <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600">
            Sosyal Ağına
          </span>{" "}
          Katıl.
        </h1>

        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Sadece <strong>@ozyegin.edu.tr</strong> e-posta adresinle giriş yap, kampüsteki etkinliklerden haberdar ol, kulüpleri keşfet ve arkadaşlarınla iletişime geç.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6">
          <AuthButton />

          <button
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-neutral-700 bg-white ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800 dark:hover:bg-neutral-800 transition-all duration-300"
          >
            Nasıl Çalışır?
          </button>
        </div>

        {/* Feature Highlights Mini */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Güvenli Alan</h3>
            <p className="text-sm text-neutral-500 text-center">Kampüs dışından kimse giremez</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Kulüpler & Pazar</h3>
            <p className="text-sm text-neutral-500 text-center">Kampüs içi ticaret ve etkinlikler</p>
          </div>
          <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Gerçek Zamanlı</h3>
            <p className="text-sm text-neutral-500 text-center">Anlık bildirimler ve modern akış</p>
          </div>
        </div>
      </main>
    </div>
  );
}

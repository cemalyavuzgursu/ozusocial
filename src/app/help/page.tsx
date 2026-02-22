import AuthButton from "@/components/auth/AuthButton";
import Link from "next/link";

export const dynamic = "force-static";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6 pb-20">
            <header className="py-6 flex items-center justify-between max-w-5xl mx-auto">
                <Link href="/" className="px-4 py-2 rounded-full font-bold text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-800 transition-colors shadow-sm">
                    ÖzüSocial Ana Sayfa
                </Link>
                <AuthButton />
            </header>

            <div className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                        Nasıl Çalışır?
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Kampüsünüzün kapalı sosyal ağı hakkında sıkça sorulan sorular.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Sadece üniversiteliler mi girebilir?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Evet. Sisteme sadece admin panelinde tanımlı olan üniversite e-posta adresleri (örn: <span className="font-mono text-rose-500">@ozyegin.edu.tr</span>, <span className="font-mono text-rose-500">@boun.edu.tr</span>) ile .edu.tr uzantılı mail hesaplarıyla kayıt olunabilir. Dışarıdan hiç kimse kampüs ağındaki paylaşımları göremez.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Etkinlikleri kimler görebilir?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Öğrenci kulüpleri (CLUB yetkisine sahip hesaplar) etkinlik oluşturabilir. Etkinliği oluştururken "Sadece Kendi Üniversitem Gürsün" seçeneği işaretlenirse, bu etkinlik sadece o üniversiteden kaydolan kullanıcılara gösterilir. Aksi takdirde diğer üniversitelerdeki kullanıcılar da bu etkinliği sistemde görebilir.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Gizli Hesap (Private) nedir?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Hesabınızı gizli yaptığınızda, paylaştığınız gönderiler ana sayfadaki "Tümü" akışında diğer kullanıcılara görünmez. Sadece sizi takip eden ve sizin onayladığınız kullanıcılar profilinize girebilir ve gönderilerinizi görebilir. Profilinizi ayarlar sekmesinden "Gizli" konuma getirebilirsiniz.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Uygunsuz içerik olursa ne yapabilirim?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Paylaşılan gönderileri, yorumları veya kullanıcı profillerini "Raporla" butonuyla yönetim ekibine bildirebilirsiniz. Yöneticiler içeriği inceledikten sonra silme işlemi uygulayabilir veya kullanıcıyı sistemden banlayabilir. Gerekli durumlarda "Destek" sekmesinden bize doğrudan ulaşabilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

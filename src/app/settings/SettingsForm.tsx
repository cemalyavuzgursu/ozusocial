"use client";

import { useState, useRef, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { requestClubRole } from "@/app/actions/role-request";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
    user: {
        name: string | null;
        image: string | null;
        coverImage: string | null;
        isPrivate: boolean;
        showProfileDetails: boolean;
        department: string | null;
        birthYear: number | null;
        showDepartment: boolean;
        showBirthYear: boolean;
        role: string;
        bio: string | null;
    };
    universityDepartments: string[];
}

export default function SettingsForm({ user, universityDepartments }: SettingsFormProps) {
    const router = useRouter();
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.coverImage);

    const [isPrivate, setIsPrivate] = useState(user.isPrivate);
    const [department, setDepartment] = useState(user.department || "");
    // birthYear is read-only — not editable after onboarding
    const [showDepartment, setShowDepartment] = useState(user.showDepartment ?? true);
    const [showBirthYear, setShowBirthYear] = useState(user.showBirthYear ?? true);

    const [clubRequestMessage, setClubRequestMessage] = useState("");
    const [clubRequestStatus, setClubRequestStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [isPendingClubRequest, startTransition] = useTransition();

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File, type: "profile" | "banner") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Yükleme başarısız");
        }

        const data = await res.json();
        return data.url;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleClubRequest = () => {
        if (!clubRequestMessage.trim()) {
            setClubRequestStatus({ type: 'error', msg: "Lütfen kulüp gerekçenizi belirtin." });
            return;
        }

        startTransition(async () => {
            const result = await requestClubRole(clubRequestMessage.trim());
            if (result.error) {
                setClubRequestStatus({ type: 'error', msg: result.error });
            } else {
                setClubRequestStatus({ type: 'success', msg: "Başvurunuz başarıyla alındı!" });
                setClubRequestMessage("");
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            let finalAvatarUrl = user.image;
            let finalBannerUrl = user.coverImage;

            if (avatarInputRef.current?.files?.[0]) {
                finalAvatarUrl = await uploadFile(avatarInputRef.current.files[0], "profile");
            }

            if (bannerInputRef.current?.files?.[0]) {
                finalBannerUrl = await uploadFile(bannerInputRef.current.files[0], "banner");
            }

            await updateProfile({
                name: name,
                image: finalAvatarUrl || undefined,
                coverImage: finalBannerUrl || undefined,
                isPrivate,
                showProfileDetails: true,
                department: department.trim() || undefined,
                showDepartment,
                showBirthYear,
                bio: bio.trim() || undefined
            });

            setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi.' });
            router.refresh();

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Bir hata oluştu." });
        } finally {
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {message && (
                <div className={`p-4 rounded-xl text-sm font-semibold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30'}`}>
                    {message.text}
                </div>
            )}

            {/* Arka Plan (Banner) Bölümü */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Arka Plan Resmi</label>
                <div
                    className="relative h-40 sm:h-48 rounded-3xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden cursor-pointer group shadow-sm"
                    onClick={() => bannerInputRef.current?.click()}
                >
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-indigo-500/20"></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Arka Planı Değiştir
                        </span>
                    </div>
                    <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
                </div>
            </div>

            {/* Profil Resmi Bölümü */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Profil Fotoğrafı</label>
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800/50">
                    <div
                        className="relative w-28 h-28 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 overflow-hidden cursor-pointer group shadow-md"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-500">
                                {name?.charAt(0)}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">Görünümünüzü Tazeleyin</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">Projeye uygun şık bir profil fotoğrafı ile kampüsteki etkileşiminizi canlandırın. Maksimum boyut 5MB önerilmektedir.</p>
                    </div>
                </div>
            </div>

            {/* İsim Bölümü */}
            <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Adınız Soyadınız</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-4 focus:ring-rose-500/10 transition-all text-neutral-900 dark:text-neutral-100 outline-none font-medium"
                />
            </div>

            {/* Biyografi Bölümü */}
            <div className="flex flex-col gap-2">
                <label htmlFor="bio" className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Hakkımda / Biyografi</label>
                <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={160}
                    placeholder="Kendinizden veya ilgi alanlarınızdan bahsedin..."
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-4 focus:ring-rose-500/10 transition-all text-neutral-900 dark:text-neutral-100 outline-none font-medium resize-none min-h-[100px]"
                />
                <span className="text-xs text-neutral-500 ml-1">{bio.length}/160 karakter</span>
            </div>

            {/* Eğitim Bilgileri */}
            <div className="flex flex-col gap-5 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Kişisel Bilgiler</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="department" className="text-sm font-semibold text-neutral-700 dark:text-neutral-400">Bölümünüz</label>
                        {universityDepartments.length > 0 ? (
                            <div className="relative">
                                <select
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 transition-all text-sm text-neutral-900 dark:text-neutral-100 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Bölüm seçin...</option>
                                    {universityDepartments.map((dep, i) => (
                                        <option key={i} value={dep}>{dep}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        ) : (
                            <input
                                id="department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                                placeholder="Örn: Hukuk Fakültesi"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 transition-all text-sm text-neutral-900 dark:text-neutral-100 outline-none"
                            />
                        )}
                        <label className="flex items-center gap-2 mt-1 cursor-pointer w-fit group">
                            <input type="checkbox" checked={showDepartment} onChange={(e) => setShowDepartment(e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 text-rose-500 focus:ring-rose-500 bg-neutral-100 dark:bg-neutral-900 w-4 h-4" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-rose-500 transition-colors">Profilde Göster</span>
                        </label>
                    </div>

                    {/* Doğum Yılı — kilitli, sadece görünürlük tercihi değiştirilebilir */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-400">Doğum Yılınız</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-neutral-100/60 dark:bg-neutral-800/40 text-sm text-neutral-400 dark:text-neutral-500 select-none border border-dashed border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            {user.birthYear ? `${user.birthYear} (Değiştirilemez)` : "Belirtilmemiş"}
                        </div>
                        <label className="flex items-center gap-2 mt-1 cursor-pointer w-fit group">
                            <input type="checkbox" checked={showBirthYear} onChange={(e) => setShowBirthYear(e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 text-rose-500 focus:ring-rose-500 bg-neutral-100 dark:bg-neutral-900 w-4 h-4" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-rose-500 transition-colors">Profilde Göster</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Gizlilik Ayarları */}
            <div className="flex flex-col gap-4 mt-2 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Hesap Gizliliği</h3>
                <label className="flex items-center justify-between cursor-pointer group p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Gizli Hesap Mode</span>
                        <span className="text-xs text-neutral-500 mt-0.5">Yalnızca seni takip eden onaylı kullanıcılar ağını görüntüleyebilir.</span>
                    </div>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isPrivate ? 'bg-rose-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-[1.3rem]' : 'translate-x-1'}`} />
                        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="sr-only" />
                    </div>
                </label>
            </div>

            {/* Kulüp Başvurusu Bölümü */}
            {user.role === "STUDENT" && (
                <div className="flex flex-col gap-4 mt-2 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-1.5 rounded-lg">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </span>
                            Öğrenci Kulübü Sistemi
                        </h3>
                        <p className="text-sm text-neutral-500 mt-2">Bu hesabın resmi bir öğrenci topluluğuna tahsis edilmesini mi istiyorsunuz? Rol onayı için admin yönetimine mesajınızı ve vizyonunuzu iletin.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                        <input
                            type="text"
                            placeholder="Kulüp adınızı ve yetkili olduğunuzu açıklayın..."
                            value={clubRequestMessage}
                            onChange={(e) => setClubRequestMessage(e.target.value)}
                            maxLength={100}
                            className="w-full flex-1 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 transition-all text-neutral-900 dark:text-neutral-100 outline-none text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleClubRequest}
                            disabled={isPendingClubRequest || !clubRequestMessage.trim()}
                            className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                        >
                            {isPendingClubRequest ? "İletiliyor.." : "Talep Et"}
                        </button>
                    </div>

                    {clubRequestStatus && (
                        <p className={`text-sm font-semibold p-3 rounded-xl ${clubRequestStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30'}`}>
                            {clubRequestStatus.msg}
                        </p>
                    )}
                </div>
            )}

            {/* Kaydet Butonu */}
            <div className="sticky bottom-4 pt-6 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 rounded-xl px-12 py-3.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 transition-all duration-300 shadow-xl hover:shadow- rose-500/30 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Kaydediliyor...
                        </>
                    ) : (
                        "Değişiklikleri Kaydet"
                    )}
                </button>
            </div>
        </form>
    );
}

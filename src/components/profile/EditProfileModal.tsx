"use client";

import { useState, useRef, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { requestClubRole } from "@/app/actions/role-request";
import { useRouter } from "next/navigation";

interface EditProfileModalProps {
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
        bio?: string | null;
    };
    onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
    const router = useRouter();
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image);
    const [bannerPreview, setBannerPreview] = useState<string | null>(user.coverImage);

    const [isPrivate, setIsPrivate] = useState(user.isPrivate);
    const [showProfileDetails, setShowProfileDetails] = useState(user.showProfileDetails);

    const [department, setDepartment] = useState(user.department || "");
    const [birthYear, setBirthYear] = useState(user.birthYear?.toString() || "");

    const [showDepartment, setShowDepartment] = useState(user.showDepartment ?? true);
    const [showBirthYear, setShowBirthYear] = useState(user.showBirthYear ?? true);

    const [clubRequestMessage, setClubRequestMessage] = useState("");
    const [clubRequestStatus, setClubRequestStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [isPendingClubRequest, startTransition] = useTransition();

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    // Dosya Yükleme Yardımcısı
    const uploadFile = async (file: File, type: "profile" | "banner") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        // Yükleme API'sine istek at
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Yükleme başarısız");
        }

        const data = await res.json();
        return data.url; // /uploads/banner-123.jpg gibi URL dönecek
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarPreview(URL.createObjectURL(file)); // Geçici önizleme
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setBannerPreview(URL.createObjectURL(file)); // Geçici önizleme
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
        setError(null);

        try {
            let finalAvatarUrl = user.image;
            let finalBannerUrl = user.coverImage;

            // Eğer yeni bir profil resmi seçildiyse:
            if (avatarInputRef.current?.files?.[0]) {
                finalAvatarUrl = await uploadFile(avatarInputRef.current.files[0], "profile");
            }

            // Eğer yeni bir banner resmi seçildiyse:
            if (bannerInputRef.current?.files?.[0]) {
                finalBannerUrl = await uploadFile(bannerInputRef.current.files[0], "banner");
            }

            // Action çağrısı ile veritabanını güncelle
            await updateProfile({
                name: name,
                image: finalAvatarUrl || undefined,
                coverImage: finalBannerUrl || undefined,
                isPrivate,
                showProfileDetails,
                department: department.trim() || undefined,
                birthYear: birthYear ? parseInt(birthYear) : undefined,
                showDepartment,
                showBirthYear,
                bio: bio.trim() || undefined
            });

            router.refresh(); // Sayfayı yenile ve yeni verileri çek
            onClose(); // Modalı kapat

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Gövde */}
                <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Profili Düzenle</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Arka Plan (Banner) Bölümü */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Arka Plan Resmi</label>
                            <div
                                className="relative h-32 rounded-2xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden cursor-pointer group"
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                {bannerPreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-indigo-500/20"></div>
                                )}

                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Değiştir
                                    </span>
                                </div>
                                <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
                            </div>
                        </div>

                        {/* Profil Resmi Bölümü */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Profil Fotoğrafı</label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 overflow-hidden cursor-pointer group shadow-md"
                                    onClick={() => avatarInputRef.current?.click()}
                                >
                                    {avatarPreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-neutral-500">
                                            {name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                </div>
                                <p className="text-xs text-neutral-500 flex-1">Görünümünü tazelemek için tıkla. (Maksimum 5MB önerilir)</p>
                            </div>
                        </div>

                        {/* İsim Bölümü */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Görüntülenen İsim</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-0 transition-colors text-neutral-900 dark:text-neutral-100 outline-none"
                            />
                        </div>

                        {/* Bio / Hakkımda Bölümü */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="bio" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Hakkımda</label>
                                <span className={`text-xs ${bio.length > 150 ? 'text-rose-500' : 'text-neutral-400'}`}>
                                    {bio.length}/160
                                </span>
                            </div>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={160}
                                placeholder="Kendinden kısaca bahset..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-0 transition-colors text-neutral-900 dark:text-neutral-100 outline-none resize-none custom-scrollbar"
                            />
                        </div>

                        {/* Eğitim Bilgileri */}
                        <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">Eğitim & Kişisel Bilgiler</h3>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label htmlFor="department" className="text-xs font-semibold text-neutral-700 dark:text-neutral-400">Bölüm</label>
                                    <input
                                        id="department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="Örn: Bilgisayar Mühendisliği"
                                        className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-rose-500 transition-colors text-sm text-neutral-900 dark:text-neutral-100 outline-none"
                                    />
                                    <label className="flex items-center gap-2 mt-1 cursor-pointer w-fit">
                                        <input type="checkbox" checked={showDepartment} onChange={(e) => setShowDepartment(e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 text-rose-500 focus:ring-rose-500 bg-neutral-100 dark:bg-neutral-900 w-3.5 h-3.5" />
                                        <span className="text-[10px] text-neutral-500 font-medium">Profilde Göster</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-1/2 pr-2">
                                <label htmlFor="birthYear" className="text-xs font-semibold text-neutral-700 dark:text-neutral-400">Doğum Yılı</label>
                                <input
                                    id="birthYear" type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                                    placeholder="Örn: 2002" min="1950" max={new Date().getFullYear()}
                                    className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-rose-500 transition-colors text-sm text-neutral-900 dark:text-neutral-100 outline-none"
                                />
                                <label className="flex items-center gap-2 mt-1 cursor-pointer w-fit">
                                    <input type="checkbox" checked={showBirthYear} onChange={(e) => setShowBirthYear(e.target.checked)} className="rounded border-neutral-300 dark:border-neutral-700 text-rose-500 focus:ring-rose-500 bg-neutral-100 dark:bg-neutral-900 w-3.5 h-3.5" />
                                    <span className="text-[10px] text-neutral-500 font-medium">Profilde Göster</span>
                                </label>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        {/* Ekstra Gizlilik Ayarları (Switchs / Toggles) */}
                        <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-500 transition-colors">Gizli Hesap</span>
                                    <span className="text-xs text-neutral-500">Sadece seni takip edenler gönderilerini görebilir.</span>
                                </div>
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                                    <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="sr-only" />
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group opacity-50 pointer-events-none hidden">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-500 transition-colors">Eğitim Bilgilerini Göster</span>
                                    <span className="text-xs text-neutral-500">Deprecated</span>
                                </div>
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showProfileDetails ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showProfileDetails ? 'translate-x-6' : 'translate-x-1'}`} />
                                    <input type="checkbox" checked={showProfileDetails} onChange={(e) => setShowProfileDetails(e.target.checked)} className="sr-only" />
                                </div>
                            </label>
                        </div>

                        {/* Kulüp Başvurusu Bölümü */}
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Kulüp Hesabı Başvurusu
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1">Eğer resmi bir kulüp temsilcisi iseniz buradan başvuru yapabilirsiniz.</p>
                            </div>

                            <div className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    placeholder="Kulüp adınızı ve kısaca nedeninizi yazın..."
                                    value={clubRequestMessage}
                                    onChange={(e) => setClubRequestMessage(e.target.value)}
                                    maxLength={100}
                                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 border-transparent focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-900 transition-colors text-neutral-900 dark:text-neutral-100 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleClubRequest}
                                    disabled={isPendingClubRequest || !clubRequestMessage.trim()}
                                    className="px-4 py-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isPendingClubRequest ? "İletiliyor.." : "Başvur"}
                                </button>
                            </div>

                            {clubRequestStatus && (
                                <p className={`text-xs font-semibold px-2 py-1 rounded-md inline-flex w-fit ${clubRequestStatus.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                    {clubRequestStatus.msg}
                                </p>
                            )}
                        </div>

                        {/* Alt Butonlar */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-full text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                disabled={isSubmitting}
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-2.5 text-sm font-semibold text-white bg-black dark:bg-white dark:text-black hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSubmitting ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                                ) : (
                                    "Kaydet"
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

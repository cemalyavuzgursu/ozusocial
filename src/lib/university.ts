export const POPULAR_UNIVERSITIES: Record<string, string> = {
    "ozu.edu.tr": "Özyeğin Üniversitesi",
    "ozyegin.edu.tr": "Özyeğin Üniversitesi",
    "boun.edu.tr": "Boğaziçi Üniversitesi",
    "metu.edu.tr": "Orta Doğu Teknik Üniversitesi",
    "odtu.edu.tr": "Orta Doğu Teknik Üniversitesi",
    "bilkent.edu.tr": "Bilkent Üniversitesi",
    "itu.edu.tr": "İstanbul Teknik Üniversitesi",
    "ku.edu.tr": "Koç Üniversitesi",
    "sabanciuniv.edu": "Sabancı Üniversitesi",
    "gsu.edu.tr": "Galatasaray Üniversitesi",
    "hacettepe.edu.tr": "Hacettepe Üniversitesi",
    "yildiz.edu.tr": "Yıldız Teknik Üniversitesi",
    "ankara.edu.tr": "Ankara Üniversitesi",
    "istanbul.edu.tr": "İstanbul Üniversitesi",
    "marmara.edu.tr": "Marmara Üniversitesi",
    "ege.edu.tr": "Ege Üniversitesi",
    "deu.edu.tr": "Dokuz Eylül Üniversitesi",
    "gazi.edu.tr": "Gazi Üniversitesi",
    "ibu.edu.tr": "Bolu Abant İzzet Baysal Üniversitesi",
    "tau.edu.tr": "Türk-Alman Üniversitesi",
    "bahcesehir.edu.tr": "Bahçeşehir Üniversitesi",
    "yeditepe.edu.tr": "Yeditepe Üniversitesi",
    "khas.edu.tr": "Kadir Has Üniversitesi",
    "medipol.edu.tr": "Medipol Üniversitesi",
    "bilgi.edu.tr": "İstanbul Bilgi Üniversitesi",
    "istinye.edu.tr": "İstinye Üniversitesi",
    "iku.edu.tr": "İstanbul Kültür Üniversitesi",
    "aydin.edu.tr": "İstanbul Aydın Üniversitesi",
    "gelisim.edu.tr": "İstanbul Gelişim Üniversitesi",
    // Eklemeler yapılabilir...
};

/**
 * E-posta adresinden üniversite adını çıkaran yardımcı fonksiyon.
 * Bilinenleri Map'ten alır, bilinmeyenleri otomatik Title Case formatına sokar.
 */
export function getUniversityFromEmail(email: string | null | undefined): string {
    if (!email) return "Bilinmeyen Üniversite";

    const parts = email.split("@");
    if (parts.length !== 2) return "Bilinmeyen Üniversite";

    const domain = parts[1].toLowerCase();

    // Sadece eğitim e-postalarına izin vermek istersek ekstra kontrol yapabiliriz ancak
    // bu auth tarafında engelleniyor. Profilde yazan domaini direkt yorumlamak yetecek.

    // Test kullanıcısına özel izin
    if (domain === "gmail.com") return "Test Üniversitesi";

    // Domain popüler listedeyse, haritalanmış güzel ismini ver.
    if (POPULAR_UNIVERSITIES[domain]) {
        return POPULAR_UNIVERSITIES[domain];
    }

    // Haritada yoksa (örn: sdu.edu.tr -> Sdu Üniversitesi formatlaması)
    const domainPrefix = domain.replace(".edu.tr", "").replace(".edu", "");

    // Baş harfi büyüt
    const formattedPrefix = domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);

    return `${formattedPrefix} Üniversitesi`;
}

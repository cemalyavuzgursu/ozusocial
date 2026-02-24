import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "UniVibe — Kampüs Sosyal Ağı",
        short_name: "UniVibe",
        description: "Üniversite öğrencilerine özel sosyal ağ",
        start_url: "/feed",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#e11d48",
        orientation: "portrait",
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";

interface MediaItem {
    url: string;
    type: string;
}

export default function PostMediaCarousel({ media }: { media: MediaItem[] }) {
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef<number | null>(null);

    if (!media || media.length === 0) return null;

    const prev = () => setCurrent(c => (c - 1 + media.length) % media.length);
    const next = () => setCurrent(c => (c + 1) % media.length);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
        }
        touchStartX.current = null;
    };

    const item = media[current];

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 mb-4 group"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Medya */}
            <div className="relative">
                {item.type === "VIDEO" ? (
                    <video
                        key={item.url}
                        src={item.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-[500px] bg-black"
                    />
                ) : (
                    <img
                        src={item.url}
                        alt=""
                        className="w-full max-h-[500px] object-contain"
                    />
                )}
            </div>

            {/* Önceki / Sonraki butonları — birden fazla medya varsa göster */}
            {media.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Sayaç */}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                        {current + 1} / {media.length}
                    </div>

                    {/* Nokta göstergesi */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {media.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

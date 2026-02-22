"use client";

import { useEffect, useState } from "react";

const domains = ["ozyegin.edu.tr", "boun.edu.tr", "itu.edu.tr", "ku.edu.tr", "yildiz.edu.tr", "gsu.edu.tr", "edu.tr"];

export default function TypewriterEffect() {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const word = domains[currentWordIndex];
        const typingSpeed = isDeleting ? 50 : 100;

        const timeout = setTimeout(() => {
            if (!isDeleting && currentText === word) {
                // Kelime tamamlandı, bekleyip silmeye başla
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && currentText === "") {
                // Silme tamamlandı, sonraki kelimeye geç
                setIsDeleting(false);
                setCurrentWordIndex((prev) => (prev + 1) % domains.length);
            } else {
                // Yazma veya silme işlemi
                setCurrentText(
                    isDeleting
                        ? word.substring(0, currentText.length - 1)
                        : word.substring(0, currentText.length + 1)
                );
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex]);

    return (
        <span className="font-mono text-rose-500 min-w-[160px] sm:min-w-[200px] inline-block text-left transition-all relative">
            @{currentText}
            <span className="animate-pulse border-r-2 border-rose-500 ml-1 h-5 inline-block absolute bottom-1/2 translate-y-[45%]"></span>
        </span>
    );
}

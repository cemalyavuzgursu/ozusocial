"use client";

import { useState } from "react";
import CreateEventModal from "@/components/events/CreateEventModal";

export default function CreateEventButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Etkinlik Ekle
                </span>
            </button>

            {isModalOpen && (
                <CreateEventModal onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}

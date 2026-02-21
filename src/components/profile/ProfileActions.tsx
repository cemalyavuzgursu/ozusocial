"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

interface ProfileActionsProps {
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
    };
    isOwnProfile: boolean;
}

export default function ProfileActions({ user, isOwnProfile }: ProfileActionsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // If this is not the user's own profile, we don't show the edit button (for now we assume it is)
    if (!isOwnProfile) return null;

    return (
        <>
            <button
                onClick={() => setIsEditModalOpen(true)}
                className="mt-4 sm:mt-0 px-5 py-2 rounded-full text-sm font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 shadow-sm z-10"
            >
                Profili Düzenle
            </button>

            {isEditModalOpen && (
                <EditProfileModal user={user} onClose={() => setIsEditModalOpen(false)} />
            )}
        </>
    );
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
    name?: string;
    image?: string;
    coverImage?: string;
    isPrivate?: boolean;
    showProfileDetails?: boolean;
    department?: string;
    birthYear?: number;
    showDepartment?: boolean;
    showBirthYear?: boolean;
    bio?: string;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        throw new Error("Giriş yapmalısınız!");
    }

    // Update User
    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.image !== undefined && { image: data.image }),
            ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
            ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
            ...(data.showProfileDetails !== undefined && { showProfileDetails: data.showProfileDetails }),
            ...(data.department !== undefined && { department: data.department }),
            ...(data.birthYear !== undefined && { birthYear: data.birthYear }),
            ...(data.showDepartment !== undefined && { showDepartment: data.showDepartment }),
            ...(data.showBirthYear !== undefined && { showBirthYear: data.showBirthYear }),
            ...(data.bio !== undefined && { bio: data.bio }),
        },
    });

    // Revalidate profile page 
    revalidatePath("/profile");
}

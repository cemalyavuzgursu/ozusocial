"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function EventSortDropdown({ sortOrder }: { sortOrder: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (val === "asc") {
            current.delete("sort");
        } else {
            current.set("sort", val);
        }
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`/events${query}`);
    };

    return (
        <select
            value={sortOrder}
            onChange={handleChange}
            className="bg-neutral-100 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 cursor-pointer"
        >
            <option value="asc">Önce Yaklaşanlar</option>
            <option value="desc">Önce İleri Tarihliler</option>
        </select>
    );
}

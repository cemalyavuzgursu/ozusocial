export default function ClubBadge({ className = "" }: { className?: string }) {
    return (
        <span className={`inline-flex items-center justify-center bg-blue-500 text-white rounded-full p-0.5 ml-1 shadow-sm ${className}`} title="Resmi Öğrenci Kulübü / Topluluğu">
            <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </span>
    );
}

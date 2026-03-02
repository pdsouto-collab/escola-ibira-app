export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7] relative overflow-hidden">
            {/* Soft decorative shapes to match the hero style */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EDE3DA]/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#E89F67]/5 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl opacity-50" />

            <div className="w-full max-w-md p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 ring-1 ring-black/5 z-10 mx-4">
                {children}
            </div>
        </div>
    );
}

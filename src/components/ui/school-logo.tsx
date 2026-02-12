import React from 'react';

export function SchoolLogo({ className = "h-8 w-auto" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Isotype */}
            <svg viewBox="0 0 100 80" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="20" r="15" fill="#E89F67" /> {/* Orange Head */}
                <path d="M50 40 Q30 40 30 60 L30 75 Q30 80 40 80 L60 80 Q70 80 70 75 L70 60 Q70 40 50 40" fill="#2E798A" /> {/* Teal Body */}
                <path d="M25 45 Q15 45 15 35 L20 25" stroke="#A85648" strokeWidth="6" strokeLinecap="round" /> {/* Red Arm */}
                <path d="M75 45 Q85 45 85 35 L80 25" stroke="#7FA075" strokeWidth="6" strokeLinecap="round" /> {/* Green Arm */}
            </svg>

            {/* Logotype */}
            <div className="flex flex-col justify-center">
                <span className="text-[0.6rem] tracking-[0.3em] text-slate-400 font-medium leading-none ml-1">ESCOLA</span>
                <span className="text-xl font-bold text-[#4A6C58] tracking-wide leading-none" style={{ fontFamily: 'var(--font-geist-sans)' }}>IBIRÁ</span>
            </div>
        </div>
    );
}

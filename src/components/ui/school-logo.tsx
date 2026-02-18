import React from 'react';
import { cn } from "@/lib/utils";

interface SchoolLogoProps {
    className?: string;
    variant?: "default" | "light";
}

export function SchoolLogo({ className = "h-8 w-auto", variant = "default" }: SchoolLogoProps) {
    const isLight = variant === "light";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Isotype */}
            <svg viewBox="0 0 100 80" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="20" r="15" fill="#E89F67" /> {/* Orange Head (keep) */}
                <path
                    d="M50 40 Q30 40 30 60 L30 75 Q30 80 40 80 L60 80 Q70 80 70 75 L70 60 Q70 40 50 40"
                    fill={isLight ? "#FFFFFF" : "#2E798A"}
                    className="transition-colors"
                /> {/* Body: Teal -> White in light mode */}
                <path d="M25 45 Q15 45 15 35 L20 25" stroke={isLight ? "#E89F67" : "#A85648"} strokeWidth="6" strokeLinecap="round" /> {/* Arm: Red -> Orange */}
                <path d="M75 45 Q85 45 85 35 L80 25" stroke="#7FA075" strokeWidth="6" strokeLinecap="round" /> {/* Green Arm */}
            </svg>

            {/* Logotype */}
            <div className="flex flex-col justify-center">
                <span className={cn(
                    "text-[0.6rem] tracking-[0.3em] font-medium leading-none ml-1 transition-colors",
                    isLight ? "text-white/80" : "text-slate-400"
                )}>
                    ESCOLA
                </span>
                <span
                    className={cn(
                        "text-xl font-bold tracking-wide leading-none transition-colors",
                        isLight ? "text-white" : "text-[#4A6C58]"
                    )}
                    style={{ fontFamily: 'var(--font-geist-sans)' }}
                >
                    IBIRÁ
                </span>
            </div>
        </div>
    );
}

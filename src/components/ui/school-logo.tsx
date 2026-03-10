import React from 'react';
import { cn } from "@/lib/utils";

interface SchoolLogoProps {
    className?: string;
    variant?: "default" | "light";
}

export function SchoolLogo({ className = "h-8 w-auto", variant = "default" }: SchoolLogoProps) {
    const isLight = variant === "light";
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    return (
        <div className={cn("relative", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`${basePath}images/logo-ibira-novo-colorido.png`}
                alt="Escola Ibirá"
                className="h-full w-auto object-contain"
            />
        </div>
    );
}

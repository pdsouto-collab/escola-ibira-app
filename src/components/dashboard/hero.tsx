"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function DashboardHero() {
    return (
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8 md:p-12 mb-8">
            {/* Background Decorations (Abstract Shapes) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

            {/* Top Bar inside Hero */}
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Bell className="w-5 h-5 text-white" />
                </button>
                <Avatar className="border-2 border-white/50 cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            </div>

            {/* Content */}
            <div className="relative z-10 mt-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Olá, <span className="underline decoration-wavy decoration-yellow-400">Ana Pereira</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-lg leading-relaxed">
                    Bem-vinda de volta! Aqui está o resumo das suas atividades e pendências escolares.
                </p>
            </div>

            {/* Playful Icon Decoration */}
            <div className="absolute top-1/4 right-1/4 text-white/20">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                </svg>
            </div>
        </div>
    );
}

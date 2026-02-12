"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function DashboardHero() {
    return (
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#2E798A] to-[#4A6C58] text-white p-8 md:p-12 mb-8 shadow-lg">
            {/* Background Decorations (Organic Shapes) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#E89F67]/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

            {/* Top Bar inside Hero */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Bell className="w-5 h-5 text-white" />
                </button>
                <Avatar className="border-2 border-white/50 cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            </div>

            {/* Content */}
            <div className="relative z-10 mt-4 flex flex-col md:flex-row items-center justify-between">
                <div className="max-w-lg">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Olá, <span className="underline decoration-wavy decoration-[#E89F67]">Ana Pereira</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                        Bem-vinda de volta! Aqui está o resumo das suas atividades e pendências escolares.
                    </p>
                </div>
                
                {/* Tree Illustration */}
                <div className="hidden md:block absolute right-0 bottom-0 opacity-20 md:opacity-100 md:relative md:w-48 md:h-48 text-white/90 translate-y-6 md:translate-y-0">
                     <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                        {/* Trunk */}
                        <path d="M95 180V120C95 120 85 140 75 120C65 100 95 80 95 80V120H105V80C105 80 135 100 125 120C115 140 105 120 105 120V180H95Z" fill="#5D4037" />
                        {/* Leaves - Bottom Layer */}
                        <circle cx="60" cy="100" r="30" fill="#7FA075" />
                        <circle cx="140" cy="100" r="30" fill="#7FA075" />
                        <circle cx="100" cy="90" r="35" fill="#4A6C58" />
                        {/* Leaves - Middle Layer */}
                        <circle cx="80" cy="70" r="25" fill="#7FA075" />
                        <circle cx="120" cy="70" r="25" fill="#7FA075" />
                        <circle cx="100" cy="60" r="30" fill="#93C572" />
                        {/* Leaves - Top Layer */}
                        <circle cx="100" cy="40" r="20" fill="#A8E4A0" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { useAppStore } from "@/lib/store";
import { NotificationPopover } from "./notification-popover";
import { UserProfileMenu } from "../users/user-profile-menu";

export function DashboardHero() {
    const { currentUser } = useAppStore();

    return (
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#EDE3DA] text-slate-800 p-6 mb-6 shadow-sm">
            {/* Background Decorations (Organic Shapes) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#E89F67]/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

            {/* Top Bar inside Hero */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                <NotificationPopover />
                <UserProfileMenu />
            </div>

            {/* Content */}
            <div className="relative z-10 mt-4 flex flex-col md:flex-row items-center justify-between">
                <div className="max-w-lg">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#2E798A]">
                        Olá, <span className="underline decoration-wavy decoration-[#E89F67]">{currentUser?.name}</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-md">
                        Bem-vinda de volta! Aqui está o resumo das suas atividades.
                    </p>
                </div>

                {/* Logo Illustration */}
                <div className="hidden md:block absolute right-0 bottom-0 opacity-20 md:opacity-100 md:relative md:w-56 md:h-56 translate-y-8 translate-x-4 md:translate-y-6 md:translate-x-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/escola-ibira-app/images/opcao2_v5_transparent_final.png"
                        alt="Escola Ibirá"
                        className="w-full h-full object-contain origin-bottom-right"
                    />
                </div>
            </div>
        </div>
    );
}

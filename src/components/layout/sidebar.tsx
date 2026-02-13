"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Grid2X2,
    CalendarDays,
    Users,
    Settings,
    CheckCircle2,
    Video,
    FolderOpen,
    BarChart3,
    MessageCircle,
    LogOut,
    PartyPopper
} from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";

const navigation = [
    { name: "Início", href: "/", icon: LayoutDashboard },
    { name: "Práticas", href: "/mosaico", icon: Grid2X2 },
    { name: "Estudantes", href: "/alunos", icon: Users },
    { name: "Pendências", href: "/pendencias", icon: CheckCircle2 },
    { name: "Rotinas", href: "/agenda", icon: CalendarDays },
    { name: "Mural de Eventos", href: "/mural", icon: PartyPopper },
    { name: "Banco de projetos", href: "/projetos", icon: FolderOpen },
    { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
    { name: "Conversas", href: "/conversas", icon: MessageCircle },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white text-slate-800 shadow-sm">
            <div className="flex h-20 items-center justify-center border-b px-6">
                <SchoolLogo className="h-12 w-auto" />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary z-10"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-500")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    );
}

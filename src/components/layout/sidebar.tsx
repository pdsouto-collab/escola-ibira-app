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
    PartyPopper,
    GraduationCap,
    RefreshCw,
    Aperture
} from "lucide-react";
import { SchoolLogo } from "@/components/ui/school-logo";

import { BookOpen } from "lucide-react";

const navigation = [
    { name: "Início", href: "/", icon: LayoutDashboard },
    { name: "Matriz Circular", href: "/mosaico", icon: Aperture },
    { name: "Pendências", href: "/pendencias", icon: CheckCircle2 },
    { name: "Mural de Eventos", href: "/mural", icon: PartyPopper },
    { name: "Rotinas", href: "/agenda", icon: CalendarDays },
    { name: "Conversas", href: "/conversas", icon: MessageCircle },
    { name: "Banco de Projetos", href: "/projetos", icon: FolderOpen },
    { name: "Relatórios e Dashboards", href: "/relatorios", icon: BarChart3 },
    { name: "Alunos / Turmas", href: "/alunos", icon: Users },
    // Restricted Routes
    { name: "Professores", href: "/professores", icon: GraduationCap, roles: ["director", "admin"] },
    { name: "Painel Admin", href: "/admin-panel", icon: Settings, roles: ["director", "admin"] },
];

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, setCurrentUser, resetData } = useAppStore();

    const handleLogout = () => {
        // Clear current user
        // @ts-ignore - allowing null for logout
        setCurrentUser(null);
        router.push("/login");
    };

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white text-slate-800 shadow-sm">
            <div className="flex h-20 items-center justify-center border-b px-6">
                <SchoolLogo className="h-24 w-auto" />
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        // RBAC Check
                        // @ts-ignore - roles property might not exist on all items in original type inference
                        if (item.roles && (!currentUser || !item.roles.includes(currentUser.role))) {
                            return null;
                        }

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
            <div className="border-t p-4 space-y-1">
                <button
                    onClick={resetData}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Resetar Dados
                </button>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    );
}

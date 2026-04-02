"use client";

import { ScheduleItem } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { Utensils, Moon, BookOpen, Clock, Pencil, Trash2, FolderKanban, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { menuService } from "@/services/menu.service";
import { Menu } from "@/types/menu";

interface DailyScheduleProps {
    items: ScheduleItem[];
    onEdit?: (item: ScheduleItem) => void;
    onDelete?: (item: ScheduleItem) => void;
}

function getIcon(type: ScheduleItem["type"]) {
    switch (type) {
        case "meal": return Utensils;
        case "care": return Moon;
        case "project": return FolderKanban;
        default: return BookOpen; // activity
    }
}

function getColors(type: ScheduleItem["type"]) {
    switch (type) {
        case "meal": return { icon: "bg-green-100 text-green-600", dot: "bg-green-400", border: "border-green-400" };
        case "care": return { icon: "bg-amber-100 text-amber-600", dot: "bg-amber-400", border: "border-amber-400" };
        case "project": return { icon: "bg-violet-100 text-violet-600", dot: "bg-violet-500", border: "border-violet-500" };
        default: return { icon: "bg-blue-100 text-blue-600", dot: "bg-blue-400", border: "border-blue-400" };
    }
}

export function DailySchedule({ items, onEdit, onDelete }: DailyScheduleProps) {
    const [menus, setMenus] = useState<Menu[]>([]);

    useEffect(() => {
        menuService.getMenus().then(setMenus).catch(console.error);
    }, []);

    const getMenuDescription = (itemTitle: string, itemDate?: string) => {
        if (!itemDate) return "";
        const menu = menus.find(m => m.date === itemDate);
        return menu?.items.find(mi => mi.title === itemTitle)?.description || "";
    };

    return (
        <>
            <div className="relative border-l border-slate-200 ml-3 space-y-8 py-2">
                {items.map((item) => {
                    const Icon = getIcon(item.type);
                    const colors = getColors(item.type);

                    return (
                        <div key={item.id} className="relative pl-8 group">
                            {/* Timeline Connector */}
                            <div className={cn(
                                "absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border bg-white transition-colors group-hover:scale-110",
                                colors.border
                            )}>
                                <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 group/card">
                                <div className="min-w-[4rem] text-sm font-bold text-slate-500 pt-0.5">
                                    {item.time}
                                    {item.endTime && <span className="text-slate-400 block text-xs">- {item.endTime}</span>}
                                </div>

                                <div className={cn(
                                    "flex-1 bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md relative",
                                    item.type === "project" ? "border-l-4 border-l-violet-400 border-slate-100" : "border-slate-100"
                                )}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            {item.type === "project" && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded mb-1">
                                                    <FolderKanban className="h-2.5 w-2.5" />
                                                    {/* Sessao de Projeto */}
                                                    Sess&#xE3;o de Projeto
                                                </span>
                                            )}
                                            <h3 className="font-semibold text-slate-800">{item.title}</h3>
                                            {item.type === "meal" ? (
                                                <p className="mt-1 text-sm text-green-600 font-medium italic">
                                                    {getMenuDescription(item.title, item.date || undefined) || item.description || "Cardápio não definido"}
                                                </p>
                                            ) : (
                                                item.description && (
                                                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                                                )
                                            )}
                                        </div>
                                        <div className={cn("p-2 rounded-full shrink-0", colors.icon)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {onEdit && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity flex gap-1 bg-white/80 p-1 rounded-md">

                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(item)}>
                                                <Pencil className="h-3 w-3 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={() => onDelete?.(item)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </>
    );
}



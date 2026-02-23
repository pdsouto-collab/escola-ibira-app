"use client";

import { ScheduleItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Utensils, Moon, BookOpen, Clock, Pencil, Trash2, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyScheduleProps {
    items: ScheduleItem[];
    onEdit?: (item: ScheduleItem) => void;
    onDelete?: (item: ScheduleItem) => void;
}

const typeIcons = {
    activity: BookOpen,
    meal: Utensils,
    care: Moon,
    project: FolderKanban,
};

const typeColors = {
    activity: "bg-blue-100 text-blue-600 border-blue-200",
    meal: "bg-green-100 text-green-600 border-green-200",
    care: "bg-amber-100 text-amber-600 border-amber-200",
    project: "bg-violet-100 text-violet-600 border-violet-200",
};

const typeDotColors = {
    activity: "border-blue-400 bg-blue-400",
    meal: "border-green-400 bg-green-400",
    care: "border-amber-400 bg-amber-400",
    project: "border-violet-500 bg-violet-500",
};

const typeLabels = {
    activity: "Atividade",
    meal: "Alimentação",
    care: "Cuidado",
    project: "Sessão de Projeto",
};

export function DailySchedule({ items, onEdit, onDelete }: DailyScheduleProps) {
    return (
        <div className="relative border-l border-slate-200 ml-3 space-y-8 py-2">
            {items.map((item) => {
                const Icon = typeIcons[item.type] || Clock;
                const dotColors = typeDotColors[item.type] || "border-slate-400 bg-slate-400";
                const iconColor = typeColors[item.type] || "bg-slate-100 text-slate-600";
                const label = typeLabels[item.type];

                return (
                    <div key={item.id} className="relative pl-8 group">
                        {/* Timeline Connector */}
                        <div
                            className={cn(
                                "absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border bg-white transition-colors group-hover:scale-110",
                                item.type === "project" ? "border-violet-500" :
                                    item.type === "activity" ? "border-blue-400" :
                                        item.type === "meal" ? "border-green-400" :
                                            "border-amber-400"
                            )}
                        >
                            <div className={cn("h-2 w-2 rounded-full", dotColors.split(" ")[1])} />
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
                                                Sessão de Projeto
                                            </span>
                                        )}
                                        <h3 className="font-semibold text-slate-800">{item.title}</h3>
                                        {item.description && (
                                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                                        )}
                                    </div>
                                    <div className={cn("p-2 rounded-full shrink-0", iconColor)}>
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
    );
}

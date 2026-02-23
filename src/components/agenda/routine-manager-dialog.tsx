"use client";

import { useMemo } from "react";
import { ScheduleItem, SchoolClass } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Edit, CalendarDays, Clock, Users, FolderKanban } from "lucide-react";

interface RoutineManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: ScheduleItem[];
    classes: SchoolClass[];
    onDeleteRoutine: (routineId: string) => void;
    onEditRoutine: (routineId: string, exampleItem: ScheduleItem) => void;
    onDeleteProjectSessions?: (projectId: string) => void;
}

interface RoutineGroup {
    id: string;
    title: string;
    time: string;
    endTime?: string;
    classId?: string;
    itemCount: number;
    exampleItem: ScheduleItem;
    kind: "routine" | "project";
    projectId?: string;
}

export function RoutineManagerDialog({
    open,
    onOpenChange,
    schedule,
    classes,
    onDeleteRoutine,
    onEditRoutine,
    onDeleteProjectSessions,
}: RoutineManagerDialogProps) {

    const { routines, projectGroups } = useMemo(() => {
        const rGroups: Record<string, RoutineGroup> = {};
        const pGroups: Record<string, RoutineGroup> = {};

        schedule.forEach(item => {
            if (item.routineId) {
                if (!rGroups[item.routineId]) {
                    rGroups[item.routineId] = {
                        id: item.routineId,
                        title: item.title,
                        time: item.time,
                        endTime: item.endTime,
                        classId: item.classId,
                        itemCount: 0,
                        exampleItem: item,
                        kind: "routine",
                    };
                }
                rGroups[item.routineId].itemCount++;
            } else if (item.projectId) {
                if (!pGroups[item.projectId]) {
                    pGroups[item.projectId] = {
                        id: item.projectId,
                        title: item.title,
                        time: item.time,
                        endTime: item.endTime,
                        classId: item.classId,
                        itemCount: 0,
                        exampleItem: item,
                        kind: "project",
                        projectId: item.projectId,
                    };
                }
                pGroups[item.projectId].itemCount++;
            }
        });

        return {
            routines: Object.values(rGroups),
            projectGroups: Object.values(pGroups),
        };
    }, [schedule]);

    const getClassName = (classId?: string) => {
        if (!classId) return "Geral";
        return classes.find(c => c.id === classId)?.name || "Várias turmas";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Rotinas</DialogTitle>
                    <DialogDescription>
                        Visualize e gerencie suas rotinas e sessões de projeto recorrentes.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[450px] pr-4">
                    {routines.length === 0 && projectGroups.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Nenhuma rotina recorrente encontrada.
                            <p className="text-xs mt-2">Itens criados via "Nova Rotina" ou "Sessão em Massa" aparecem aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Bulk Routines */}
                            {routines.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Rotinas Recorrentes</h3>
                                    <div className="space-y-3">
                                        {routines.map(routine => (
                                            <div key={routine.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-slate-900">{routine.title}</h4>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {routine.time} {routine.endTime ? `- ${routine.endTime}` : ''}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {getClassName(routine.classId)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CalendarDays className="w-3.5 h-3.5" />
                                                            {routine.itemCount} ocorrências
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:text-blue-600"
                                                        onClick={() => onEditRoutine(routine.id, routine.exampleItem)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => onDeleteRoutine(routine.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Project Session Groups */}
                            {projectGroups.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-3 flex items-center gap-1.5">
                                        <FolderKanban className="w-3.5 h-3.5" />
                                        Sessões de Projetos
                                    </h3>
                                    <div className="space-y-3">
                                        {projectGroups.map(group => (
                                            <div key={group.id} className="flex items-center justify-between p-4 bg-violet-50 rounded-lg border border-violet-200">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-slate-900">{group.title} <span className="text-xs font-normal text-violet-500">(e outras)</span></h4>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {group.time} {group.endTime ? `- ${group.endTime}` : ''}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {getClassName(group.classId)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CalendarDays className="w-3.5 h-3.5" />
                                                            {group.itemCount} sessões
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        title="Excluir todas as sessões deste projeto da agenda"
                                                        onClick={() => onDeleteProjectSessions?.(group.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

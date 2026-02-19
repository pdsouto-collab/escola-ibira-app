"use client";

import { useState, useMemo } from "react";
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
import { Trash2, Edit, CalendarDays, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RoutineManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: ScheduleItem[];
    classes: SchoolClass[];
    onDeleteRoutine: (routineId: string) => void;
    onEditRoutine: (routineId: string, exampleItem: ScheduleItem) => void;
}

interface RoutineGroup {
    id: string; // routineId
    title: string;
    time: string;
    endTime?: string;
    classId?: string; // "all" or specific
    itemCount: number;
    exampleItem: ScheduleItem;
}

export function RoutineManagerDialog({
    open,
    onOpenChange,
    schedule,
    classes,
    onDeleteRoutine,
    onEditRoutine
}: RoutineManagerDialogProps) {

    const routines = useMemo(() => {
        const groups: Record<string, RoutineGroup> = {};

        schedule.forEach(item => {
            if (item.routineId) {
                if (!groups[item.routineId]) {
                    groups[item.routineId] = {
                        id: item.routineId,
                        title: item.title,
                        time: item.time,
                        endTime: item.endTime,
                        classId: item.classId,
                        itemCount: 0,
                        exampleItem: item
                    };
                }
                groups[item.routineId].itemCount++;
            }
        });

        return Object.values(groups);
    }, [schedule]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Rotinas</DialogTitle>
                    <DialogDescription>
                        Visualize e gerencie suas rotinas recorrentes.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {routines.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Nenhuma rotina recorrente encontrada.
                            <p className="text-xs mt-2">Apenas itens criados através da função "Nova Rotina" aparecerão aqui.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {routines.map(routine => {
                                const className = routine.classId
                                    ? (classes.find(c => c.id === routine.classId)?.name || "Todas as turmas")
                                    : "Geral";

                                return (
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
                                                    {className}
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
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

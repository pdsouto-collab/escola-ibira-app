"use client";

import { useMemo, useState } from "react";
import { ScheduleItem, SchoolClass } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, CalendarDays, Clock, Users, FolderKanban } from "lucide-react";

interface RoutineManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: ScheduleItem[];
    classes: SchoolClass[];
    onDeleteRoutine: (routineId: string) => void;
    onEditRoutine: (routineId: string, exampleItem: ScheduleItem) => void;
    onDeleteProjectSessions?: (projectId: string) => void;
    onEditProjectSessions?: (projectId: string, patch: Partial<ScheduleItem>) => void;
}

interface RoutineGroup {
    id: string;
    title: string;
    time: string;
    endTime?: string;
    description?: string;
    classId?: string;
    itemCount: number;
    exampleItem: ScheduleItem;
    kind: "routine" | "project";
}

export function RoutineManagerDialog({
    open,
    onOpenChange,
    schedule,
    classes,
    onDeleteRoutine,
    onEditRoutine,
    onDeleteProjectSessions,
    onEditProjectSessions,
}: RoutineManagerDialogProps) {

    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editPatch, setEditPatch] = useState<{ title: string; time: string; endTime: string; description: string }>({
        title: "", time: "", endTime: "", description: ""
    });

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
                        description: item.description,
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
                        description: item.description,
                        classId: item.classId,
                        itemCount: 0,
                        exampleItem: item,
                        kind: "project",
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

    const openProjectEdit = (group: RoutineGroup) => {
        setEditingProjectId(group.id);
        setEditPatch({
            title: group.title,
            time: group.time,
            endTime: group.endTime || "",
            description: group.description || "",
        });
    };

    const handleSaveProjectEdit = () => {
        if (editingProjectId) {
            onEditProjectSessions?.(editingProjectId, {
                title: editPatch.title,
                time: editPatch.time,
                endTime: editPatch.endTime,
                description: editPatch.description,
            });
        }
        setEditingProjectId(null);
    };

    return (
        <>
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
                                <p className="text-xs mt-2">Itens criados via &quot;Nova Rotina&quot; ou &quot;Sessão em Massa&quot; aparecem aqui.</p>
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
                                                        <Button variant="ghost" size="icon" className="hover:text-blue-600"
                                                            onClick={() => onEditRoutine(routine.id, routine.exampleItem)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => onDeleteRoutine(routine.id)}>
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
                                                        <h4 className="font-semibold text-slate-900">{group.title}</h4>
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
                                                        <Button variant="ghost" size="icon" className="hover:text-violet-600"
                                                            title="Editar todas as sessões deste projeto"
                                                            onClick={() => openProjectEdit(group)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            title="Excluir todas as sessões deste projeto da agenda"
                                                            onClick={() => onDeleteProjectSessions?.(group.id)}>
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

            {/* Bulk edit dialog for project sessions */}
            <Dialog open={!!editingProjectId} onOpenChange={(v) => !v && setEditingProjectId(null)}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Editar Sessões do Projeto</DialogTitle>
                        <DialogDescription>
                            As alterações serão aplicadas a todas as sessões deste projeto na agenda.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div>
                            <Label className="text-xs font-semibold text-slate-600">Título</Label>
                            <Input className="mt-1" value={editPatch.title}
                                onChange={e => setEditPatch(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-semibold text-slate-600">Horário Inicial</Label>
                                <Input type="time" className="mt-1" value={editPatch.time}
                                    onChange={e => setEditPatch(p => ({ ...p, time: e.target.value }))} />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-slate-600">Horário Final</Label>
                                <Input type="time" className="mt-1" value={editPatch.endTime}
                                    onChange={e => setEditPatch(p => ({ ...p, endTime: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-semibold text-slate-600">Descrição</Label>
                            <Textarea className="mt-1" value={editPatch.description}
                                onChange={e => setEditPatch(p => ({ ...p, description: e.target.value }))}
                                placeholder="Detalhes das sessões..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingProjectId(null)}>Cancelar</Button>
                        <Button onClick={handleSaveProjectEdit} className="bg-violet-600 hover:bg-violet-700 text-white">
                            Aplicar a todas as sessões
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ScheduleItem } from "@/lib/data";
import { SchoolClass } from "@/types/school-class";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { Trash2, Edit, CalendarDays, Clock, Users, FolderKanban } from "lucide-react";

const DAYS = [
    { label: "Dom", value: 0 },
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
];

export interface ProjectSessionBulkEdit {
    title: string;
    description: string;
    time: string;
    endTime: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    projectId?: string;
    classId?: string;
}

interface RoutineManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: ScheduleItem[];
    classes: SchoolClass[];
    onDeleteRoutine: (routineId: string) => void;
    onEditRoutine: (routineId: string, exampleItem: ScheduleItem) => void;
    onDeleteProjectSessions?: (projectId: string) => void;
    onEditProjectSessionsBulk?: (projectId: string, config: ProjectSessionBulkEdit) => void;
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
    onEditProjectSessionsBulk,
}: RoutineManagerDialogProps) {

    const { projects, students } = useAppStore();
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editConfig, setEditConfig] = useState<ProjectSessionBulkEdit>({
        title: "", description: "", time: "08:00", endTime: "09:00",
        startDate: "", endDate: "", daysOfWeek: [1, 2, 3, 4, 5],
        projectId: undefined,
        classId: "all"
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
        // Extract existing sessions for this project to pre-fill the form
        const items = schedule.filter(s => s.projectId === group.id && s.date);
        const dates = items.map(s => s.date as string).sort();
        const daySet = new Set(items.map(s => new Date(s.date + "T12:00:00").getDay()));
        const itemClasses = new Set(items.map(s => s.classId).filter(Boolean));

        setEditConfig({
            title: group.title,
            description: group.description || "",
            time: group.time,
            endTime: group.endTime || "",
            startDate: dates[0] || "",
            endDate: dates[dates.length - 1] || "",
            daysOfWeek: Array.from(daySet).sort(),
            projectId: group.id,
            classId: itemClasses.size === 1 ? Array.from(itemClasses)[0] : "all"
        });
        setEditingProjectId(group.id);
    };

    const handleProjectSelect = (value: string) => {
        if (value === "none") {
            setEditConfig({ ...editConfig, projectId: undefined });
            return;
        }

        const project = projects.find(p => p.id === value);
        if (!project) return;

        const classId = editConfig.classId;
        if (classId && classId !== "all") {
            const hasWholeClass = project.classes?.includes(classId);
            const hasAnyStudentInClass = project.students.some(sId => {
                const s = students.find(st => st.id === sId);
                return s?.classId === classId;
            });

            if (!hasWholeClass && !hasAnyStudentInClass) {
                toast.warning("Não existem alunos dessa turma vinculados ao projeto selecionado");
                return;
            }
        }

        setEditConfig({ ...editConfig, projectId: value });
    };

    const handleClassSelect = (value: string) => {
        if (editConfig.projectId && value !== "all") {
             const project = projects.find(p => p.id === editConfig.projectId);
             if (project) {
                 const hasWholeClass = project.classes?.includes(value);
                 const hasAnyStudentInClass = project.students.some(sId => {
                     const s = students.find(st => st.id === sId);
                     return s?.classId === value;
                 });
                 if (!hasWholeClass && !hasAnyStudentInClass) {
                     toast.warning("Não existem alunos dessa turma vinculados ao projeto selecionado. O projeto será desvinculado.");
                     setEditConfig({ ...editConfig, classId: value, projectId: undefined });
                     return;
                 }
             }
        }
        setEditConfig({ ...editConfig, classId: value });
    };

    const handleSaveProjectBulkEdit = () => {
        if (editingProjectId) {
            onEditProjectSessionsBulk?.(editingProjectId, editConfig);
        }
        setEditingProjectId(null);
    };

    // Estimate session count for the edit form
    const estimatedCount = (() => {
        if (!editConfig.startDate || !editConfig.endDate || editConfig.daysOfWeek.length === 0) return 0;
        let count = 0;
        const start = new Date(editConfig.startDate + "T12:00:00");
        const end = new Date(editConfig.endDate + "T12:00:00");
        const cur = new Date(start);
        while (cur <= end) {
            if (editConfig.daysOfWeek.includes(cur.getDay())) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    })();

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

                                {routines.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Rotinas Recorrentes</h3>
                                        <div className="space-y-3">
                                            {routines.map(routine => (
                                                <div key={routine.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                    <div className="space-y-1">
                                                        <h4 className="font-semibold text-slate-900">{routine.title}</h4>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{routine.time} {routine.endTime ? `- ${routine.endTime}` : ''}</div>
                                                            <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{getClassName(routine.classId)}</div>
                                                            <div className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{routine.itemCount} ocorrências</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="hover:text-blue-600" onClick={() => onEditRoutine(routine.id, routine.exampleItem)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteRoutine(routine.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                                            <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{group.time} {group.endTime ? `- ${group.endTime}` : ''}</div>
                                                            <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{getClassName(group.classId)}</div>
                                                            <div className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{group.itemCount} sessões</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="hover:text-violet-600"
                                                            title="Editar sessões em massa"
                                                            onClick={() => openProjectEdit(group)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            title="Excluir todas as sessões deste projeto"
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

            {/* Bulk edit dialog for project sessions — same pattern as BulkRoutineDialog */}
            <Dialog open={!!editingProjectId} onOpenChange={(v) => !v && setEditingProjectId(null)}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Sessões do Projeto</DialogTitle>
                        <DialogDescription>
                            Edite os detalhes. Isso recriará todas as sessões para o período selecionado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Título</Label>
                            <Input className="col-span-3" value={editConfig.title}
                                onChange={e => setEditConfig(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Início</Label>
                            <Input type="time" className="col-span-3" value={editConfig.time}
                                onChange={e => setEditConfig(p => ({ ...p, time: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Fim</Label>
                            <Input type="time" className="col-span-3" value={editConfig.endTime}
                                onChange={e => setEditConfig(p => ({ ...p, endTime: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-classId" className="text-right">Turma</Label>
                            <Select
                                value={editConfig.classId || "all"}
                                onValueChange={handleClassSelect}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione a turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as turmas</SelectItem>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-projectId" className="text-right text-indigo-600 font-semibold">Projeto</Label>
                            <Select
                                value={editConfig.projectId || "none"}
                                onValueChange={handleProjectSelect}
                            >
                                <SelectTrigger className="col-span-3 border-indigo-200">
                                    <SelectValue placeholder="Vincular a um plano pedagógico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum (Atividade Avulsa)</SelectItem>
                                    {projects.map((p: import("@/lib/data").Project) => (
                                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">De</Label>
                            <Input type="date" className="col-span-3" value={editConfig.startDate}
                                onChange={e => setEditConfig(p => ({ ...p, startDate: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Até</Label>
                            <Input type="date" className="col-span-3" value={editConfig.endDate}
                                onChange={e => setEditConfig(p => ({ ...p, endDate: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Dias</Label>
                            <div className="col-span-3 flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <div key={day.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`pe-day-${day.value}`}
                                            checked={editConfig.daysOfWeek.includes(day.value)}
                                            onCheckedChange={() => setEditConfig(p => ({
                                                ...p,
                                                daysOfWeek: p.daysOfWeek.includes(day.value)
                                                    ? p.daysOfWeek.filter(d => d !== day.value)
                                                    : [...p.daysOfWeek, day.value]
                                            }))}
                                        />
                                        <label htmlFor={`pe-day-${day.value}`} className="text-sm font-medium leading-none">{day.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Descrição</Label>
                            <Textarea className="col-span-3" value={editConfig.description}
                                onChange={e => setEditConfig(p => ({ ...p, description: e.target.value }))}
                                placeholder="Detalhes das sessões..." />
                        </div>
                        {estimatedCount > 0 && (
                            <p className="text-sm text-center text-violet-700 font-medium bg-violet-50 py-2 rounded-lg">
                                {estimatedCount} sessão{estimatedCount !== 1 ? "ões" : ""} serão criadas
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingProjectId(null)}>Cancelar</Button>
                        <Button
                            onClick={handleSaveProjectBulkEdit}
                            disabled={estimatedCount === 0}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

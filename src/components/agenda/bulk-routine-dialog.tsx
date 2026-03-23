"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/lib/data";
import { SchoolClass } from "@/types/school-class";
import { useAppStore } from "@/lib/store";

import { Student } from "@/types/student";

export interface BulkRoutineConfig {
    title: string;
    description: string;
    time: string;
    endTime: string;
    type: "activity" | "meal" | "care" | "project";
    startDate: string;
    endDate: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    classId: string;
    projectId?: string;
}

interface BulkRoutineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classes: SchoolClass[];
    students: Student[];
    initialConfig?: BulkRoutineConfig;
    onSave: (config: BulkRoutineConfig) => void;
}

const DAYS = [
    { label: "Dom", value: 0 },
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
];

export function BulkRoutineDialog({ open, onOpenChange, classes, students, initialConfig, onSave }: BulkRoutineDialogProps) {
    const { projects } = useAppStore();
    const [config, setConfig] = useState<BulkRoutineConfig>({
        title: "",
        description: "",
        time: "08:00",
        endTime: "09:00",
        type: "activity",
        startDate: "",
        endDate: "",
        daysOfWeek: [1, 2, 3, 4, 5], // Default: Mon-Fri
        classId: "all",
        projectId: undefined
    });

    useEffect(() => {
        if (open) {
            if (initialConfig) {
                setConfig(initialConfig);
            } else {
                setConfig({
                    title: "",
                    description: "",
                    time: "08:00",
                    endTime: "09:00",
                    type: "activity",
                    startDate: "",
                    endDate: "",
                    daysOfWeek: [1, 2, 3, 4, 5],
                    classId: "all",
                    projectId: undefined
                });
            }
        }
    }, [open, initialConfig]);

    const handleDayToggle = (day: number) => {
        setConfig(prev => {
            const days = prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day];
            return { ...prev, daysOfWeek: days };
        });
    };

    const handleProjectSelect = (value: string) => {
        if (value === "none") {
            setConfig({ ...config, projectId: undefined });
            return;
        }

        const project = projects.find(p => p.id === value);
        if (!project) return;

        const classId = config.classId;
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

        setConfig({ ...config, projectId: value });
    };

    const handleClassSelect = (value: string) => {
        if (config.projectId && value !== "all") {
             const project = projects.find(p => p.id === config.projectId);
             if (project) {
                 const hasWholeClass = project.classes?.includes(value);
                 const hasAnyStudentInClass = project.students.some(sId => {
                     const s = students.find(st => st.id === sId);
                     return s?.classId === value;
                 });
                 if (!hasWholeClass && !hasAnyStudentInClass) {
                     toast.warning("Não existem alunos dessa turma vinculados ao projeto selecionado. O projeto será desvinculado.");
                     setConfig({ ...config, classId: value, projectId: undefined });
                     return;
                 }
             }
        }
        setConfig({ ...config, classId: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(config);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialConfig ? "Editar Rotina" : "Criar Rotina em Massa"}</DialogTitle>
                    <DialogDescription>
                        {initialConfig
                            ? "Edite os detalhes da rotina. Isso recriará os itens para o período selecionado."
                            : "Crie itens recorrentes para vários dias de uma vez."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Title & Type */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Título</Label>
                            <Input
                                id="title"
                                value={config.title}
                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Tipo</Label>
                            <Select
                                value={config.type}
                                onValueChange={(value: any) => setConfig({ ...config, type: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activity">Atividade</SelectItem>
                                    <SelectItem value="meal">Alimentação</SelectItem>
                                    <SelectItem value="care">Cuidado/Higiene</SelectItem>
                                    <SelectItem value="project">Sessão de Projeto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project Selector - only show for Project Session type */}
                        {config.type === "project" && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectId" className="text-right text-indigo-600 font-semibold">Projeto</Label>
                                <Select
                                    value={config.projectId || "none"}
                                    onValueChange={handleProjectSelect}
                                >
                                    <SelectTrigger className="col-span-3 border-indigo-200">
                                        <SelectValue placeholder="Vincular a um plano pedagógico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum (Rotina comum)</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Class Selection */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="classId" className="text-right">Turma</Label>
                            <Select
                                value={config.classId}
                                onValueChange={handleClassSelect}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione a turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Turmas</SelectItem>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Início</Label>
                            <Input
                                id="time"
                                type="time"
                                value={config.time}
                                onChange={(e) => setConfig({ ...config, time: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endTime" className="text-right">Fim</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={config.endTime}
                                onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                                className="col-span-3"
                            />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">De</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={config.startDate}
                                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">Até</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={config.endDate}
                                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Days of Week */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Dias</Label>
                            <div className="col-span-3 flex flex-wrap gap-2">
                                {DAYS.map((day) => (
                                    <div key={day.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`day-${day.value}`}
                                            checked={config.daysOfWeek.includes(day.value)}
                                            onCheckedChange={() => handleDayToggle(day.value)}
                                        />
                                        <label
                                            htmlFor={`day-${day.value}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {day.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Descrição</Label>
                            <Textarea
                                id="description"
                                value={config.description}
                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{initialConfig ? "Salvar Alterações" : "Gerar Rotina"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

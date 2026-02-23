"use client";

import { useState, useEffect } from "react";
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
import { SchoolClass } from "@/lib/data";

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
}

interface BulkRoutineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classes: SchoolClass[];
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

export function BulkRoutineDialog({ open, onOpenChange, classes, initialConfig, onSave }: BulkRoutineDialogProps) {
    const [config, setConfig] = useState<BulkRoutineConfig>({
        title: "",
        description: "",
        time: "",
        endTime: "",
        type: "activity",
        startDate: "",
        endDate: "",
        daysOfWeek: [1, 2, 3, 4, 5], // Default: Mon-Fri
        classId: "all"
    });

    // Reset or load initial config when dialog opens
    // We use a key or effect? Let's use an effect on open change to reset if empty, or on initialConfig change
    // Better: use a simple effect to load initialConfig if present

    // Actually, react state initialization only happens once.
    // Let's use an effect to update state when initialConfig changes or open changes
    if (initialConfig && config !== initialConfig && open) {
        // This is risky for infinite loops if strict equality fails.
        // Better to do it in a useEffect dependent on open
    }

    // Recommended pattern:
    // When `open` becomes true, set config.
    // We can use a `useEffect`.

    // But since we can't easily import useEffect inside the replace block without wider context change (though I can add imports),
    // wait, I can just use key on the parent component or use effect here.
    // I'll update the component signature to include useEffect import if needed, or assume it's there?
    // It's not there in the previous file view. I'll need to add it.

    // Actually, I'll update the whole file import section too.


    useEffect(() => {
        if (open) {
            if (initialConfig) {
                setConfig(initialConfig);
            } else {
                setConfig({
                    title: "",
                    description: "",
                    time: "",
                    endTime: "",
                    type: "activity",
                    startDate: "",
                    endDate: "",
                    daysOfWeek: [1, 2, 3, 4, 5],
                    classId: "all"
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

                        {/* Class Selection */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="classId" className="text-right">Turma</Label>
                            <Select
                                value={config.classId}
                                onValueChange={(value) => setConfig({ ...config, classId: value })}
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

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScheduleItem } from "@/lib/data";

export interface BulkSessionConfig {
    title: string;
    description: string;
    time: string;
    endTime: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
}

interface BulkSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (sessions: Partial<ScheduleItem>[]) => void;
    classIds?: string[]; // if provided, creates one session per class
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

const defaultConfig = (): BulkSessionConfig => ({
    title: "",
    description: "",
    time: "",
    endTime: "",
    startDate: "",
    endDate: "",
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri default
});

export function BulkSessionDialog({ open, onOpenChange, onSave, classIds }: BulkSessionDialogProps) {
    const [config, setConfig] = useState<BulkSessionConfig>(defaultConfig());

    useEffect(() => {
        if (open) {
            setConfig(defaultConfig());
        }
    }, [open]);

    const handleDayToggle = (day: number) => {
        setConfig(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!config.startDate || !config.endDate || !config.title) return;

        const sessions: Partial<ScheduleItem>[] = [];
        const start = new Date(config.startDate + "T12:00:00");
        const end = new Date(config.endDate + "T12:00:00");

        const current = new Date(start);
        while (current <= end) {
            if (config.daysOfWeek.includes(current.getDay())) {
                sessions.push({
                    id: Math.random().toString(36).substr(2, 9),
                    title: config.title,
                    description: config.description,
                    type: "project",
                    date: current.toISOString().split("T")[0],
                    time: config.time,
                    endTime: config.endTime,
                });
            }
            current.setDate(current.getDate() + 1);
        }

        // Expand per class if classIds provided
        const effectiveClasses = classIds && classIds.length > 0 ? classIds : [undefined];
        const allSessions: Partial<ScheduleItem>[] = [];
        for (const session of sessions) {
            for (const classId of effectiveClasses) {
                allSessions.push({ ...session, id: Math.random().toString(36).substr(2, 9), classId });
            }
        }

        onSave(allSessions);
        onOpenChange(false);
    };

    const estimatedCount = (() => {
        if (!config.startDate || !config.endDate || config.daysOfWeek.length === 0) return 0;
        let count = 0;
        const start = new Date(config.startDate + "T12:00:00");
        const end = new Date(config.endDate + "T12:00:00");
        const current = new Date(start);
        while (current <= end) {
            if (config.daysOfWeek.includes(current.getDay())) count++;
            current.setDate(current.getDate() + 1);
        }
        return count;
    })();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Sessões em Massa</DialogTitle>
                    <DialogDescription>
                        Crie sessões recorrentes para vários dias de uma vez.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">

                        {/* Title */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bulk-title" className="text-right">Título</Label>
                            <Input
                                id="bulk-title"
                                value={config.title}
                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                className="col-span-3"
                                required
                                placeholder="Ex: Aula do Projeto"
                            />
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bulk-time" className="text-right">Início</Label>
                            <Input
                                id="bulk-time"
                                type="time"
                                value={config.time}
                                onChange={(e) => setConfig({ ...config, time: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bulk-endTime" className="text-right">Fim</Label>
                            <Input
                                id="bulk-endTime"
                                type="time"
                                value={config.endTime}
                                onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                                className="col-span-3"
                            />
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bulk-startDate" className="text-right">De</Label>
                            <Input
                                id="bulk-startDate"
                                type="date"
                                value={config.startDate}
                                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bulk-endDate" className="text-right">Até</Label>
                            <Input
                                id="bulk-endDate"
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
                                            id={`bulk-day-${day.value}`}
                                            checked={config.daysOfWeek.includes(day.value)}
                                            onCheckedChange={() => handleDayToggle(day.value)}
                                        />
                                        <label
                                            htmlFor={`bulk-day-${day.value}`}
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
                            <Label htmlFor="bulk-description" className="text-right">Descrição</Label>
                            <Textarea
                                id="bulk-description"
                                value={config.description}
                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                className="col-span-3"
                                placeholder="Detalhes das sessões..."
                            />
                        </div>

                        {/* Preview count */}
                        {estimatedCount > 0 && (
                            <p className="text-sm text-center text-indigo-700 font-medium bg-indigo-50 py-2 rounded-lg">
                                {estimatedCount} sessão{estimatedCount !== 1 ? "ões" : ""} serão criadas
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={estimatedCount === 0}>
                            Gerar Sessões
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

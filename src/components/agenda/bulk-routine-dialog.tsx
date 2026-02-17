"use client";

import { useState } from "react";
import { format, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScheduleItem } from "@/lib/data";
import { useAppStore } from "@/lib/store";

interface BulkRoutineDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultClassId?: string;
}

const WEEKDAYS = [
    { id: 1, label: "Seg" },
    { id: 2, label: "Ter" },
    { id: 3, label: "Qua" },
    { id: 4, label: "Qui" },
    { id: 5, label: "Sex" },
    { id: 6, label: "Sáb" },
    { id: 0, label: "Dom" },
];

const ITEM_TYPES = [
    { value: "activity", label: "Atividade" },
    { value: "meal", label: "Refeição" },
    { value: "care", label: "Cuidado/Sono" },
];

export function BulkRoutineDialog({ open, onOpenChange, defaultClassId }: BulkRoutineDialogProps) {
    const { schedule, updateSchedule } = useAppStore();

    const [classId, setClassId] = useState<string>(defaultClassId || "");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
    const [templateItems, setTemplateItems] = useState<Omit<ScheduleItem, "id" | "date" | "classId">[]>([
        { time: "08:00", endTime: "09:00", title: "Chegada", type: "care", description: "" }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAddTemplateItem = () => {
        setTemplateItems([...templateItems, { time: "09:00", endTime: "10:00", title: "", type: "activity", description: "" }]);
    };

    const handleRemoveTemplateItem = (index: number) => {
        setTemplateItems(templateItems.filter((_, i) => i !== index));
    };

    const handleUpdateTemplateItem = (index: number, field: keyof ScheduleItem, value: any) => {
        const newItems = [...templateItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setTemplateItems(newItems);
    };

    const toggleWeekday = (dayId: number) => {
        setSelectedWeekdays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const handleGenerate = async () => {
        if (!classId || !startDate || !endDate || templateItems.length === 0) return;

        setIsGenerating(true);

        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const interval = eachDayOfInterval({ start: startDate, end: endDate });
        const newItems: ScheduleItem[] = [];

        interval.forEach(date => {
            const dayOfWeek = date.getDay();
            if (selectedWeekdays.includes(dayOfWeek)) {
                const dateStr = format(date, "yyyy-MM-dd");

                templateItems.forEach(template => {
                    newItems.push({
                        ...template,
                        id: Math.random().toString(36).substr(2, 9),
                        date: dateStr,
                        classId: classId
                    });
                });
            }
        });

        // Add to existing schedule
        // In a real app, we might want to check for conflicts or clear existing items for these dates/class
        updateSchedule([...schedule, ...newItems]);

        setIsGenerating(false);
        onOpenChange(false);

        // Reset form slightly but keep some defaults
        setStartDate(undefined);
        setEndDate(undefined);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Rotina em Massa</DialogTitle>
                    <DialogDescription>
                        Defina uma rotina padrão e aplique-a para um intervalo de datas e dias da semana.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Class Selection */}
                    <div className="grid gap-2">
                        <Label>Turma</Label>
                        <Select value={classId} onValueChange={setClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a turma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="jardim-i">Jardim I</SelectItem>
                                <SelectItem value="jardim-ii">Jardim II</SelectItem>
                                <SelectItem value="maternal-i">Maternal I</SelectItem>
                                <SelectItem value="maternal-ii">Maternal II</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid gap-2">
                        <Label>Data Início</Label>
                        <Input
                            type="date"
                            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value + "T12:00:00") : undefined;
                                setStartDate(date);
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Data Fim</Label>
                        <Input
                            type="date"
                            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value + "T12:00:00") : undefined;
                                setEndDate(date);
                            }}
                        />
                    </div>

                    {/* Weekdays */}
                    <div className="grid gap-2">
                        <Label>Dias da Semana</Label>
                        <div className="flex flex-wrap gap-2">
                            {WEEKDAYS.map(day => (
                                <div key={day.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`day-${day.id}`}
                                        checked={selectedWeekdays.includes(day.id)}
                                        onCheckedChange={() => toggleWeekday(day.id)}
                                    />
                                    <label
                                        htmlFor={`day-${day.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {day.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Template Items */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label>Itens da Rotina Padrão</Label>
                            <Button size="sm" variant="outline" onClick={handleAddTemplateItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {templateItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-md border">
                                    <div className="grid gap-2 flex-1">
                                        <div className="flex gap-2">
                                            <Input
                                                type="time"
                                                value={item.time}
                                                onChange={(e) => handleUpdateTemplateItem(index, 'time', e.target.value)}
                                                className="w-24"
                                            />
                                            <Input
                                                type="time"
                                                value={item.endTime || ""}
                                                onChange={(e) => handleUpdateTemplateItem(index, 'endTime', e.target.value)}
                                                className="w-24"
                                            />
                                            <Select
                                                value={item.type}
                                                onValueChange={(value) => handleUpdateTemplateItem(index, 'type', value)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ITEM_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => handleUpdateTemplateItem(index, 'title', e.target.value)}
                                                placeholder="Título da atividade"
                                                className="flex-1"
                                            />
                                        </div>
                                        <Input
                                            value={item.description || ""}
                                            onChange={(e) => handleUpdateTemplateItem(index, 'description', e.target.value)}
                                            placeholder="Descrição (opcional)"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500"
                                        onClick={() => handleRemoveTemplateItem(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !classId || !startDate || !endDate}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gerar Rotinas
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

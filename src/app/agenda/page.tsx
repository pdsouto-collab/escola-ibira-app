"use client";

import { useState } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailySchedule } from "@/components/agenda/daily-schedule";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from "lucide-react";
import { ScheduleDialog } from "@/components/agenda/schedule-dialog";
import { BulkRoutineDialog } from "@/components/agenda/bulk-routine-dialog";
import { ScheduleItem } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
    const { schedule, updateSchedule } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

    // Filters
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedClassId, setSelectedClassId] = useState<string>("jardim-i");

    const filteredSchedule = schedule.filter(item => {
        const classMatch = item.classId === selectedClassId; // Strict filtering
        const dateMatch = !item.date || item.date === format(selectedDate, "yyyy-MM-dd");
        return classMatch && dateMatch;
    });

    // ... (rest of the component)



    const handleAdd = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: ScheduleItem) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = (item: ScheduleItem) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Remover "${item.title}"?`)) {
            const newSchedule = schedule.filter(i => i.id !== item.id);
            updateSchedule(newSchedule);
        }
    };

    const handleSave = (item: ScheduleItem) => {
        const itemToSave = {
            ...item,
            date: item.date || format(selectedDate, "yyyy-MM-dd"),
            classId: item.classId || selectedClassId
        };

        let newSchedule: ScheduleItem[];
        if (editingItem) {
            newSchedule = schedule.map(i => i.id === item.id ? itemToSave : i);
        } else {
            newSchedule = [...schedule, itemToSave];
        }
        newSchedule.sort((a, b) => a.time.localeCompare(b.time));
        updateSchedule(newSchedule);
    };

    const nextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const prevDay = () => setSelectedDate(subDays(selectedDate, 1));

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Agenda Digital</h1>
                    <p className="text-slate-500">Gerencie a rotina escolar por turma e data.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)} className="gap-2 hidden sm:flex">
                        <CalendarIcon className="w-4 h-4" />
                        Rotina em Massa
                    </Button>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Item
                    </Button>
                </div>
            </div>

            <div className="sm:hidden">
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)} className="w-full gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Criar Rotina em Massa
                </Button>
            </div>

            <div className="bg-white rounded-xl border p-4 sm:p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="w-full sm:w-auto flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white">
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

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button variant="ghost" size="icon" onClick={prevDay}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="date"
                                className="pl-10 h-10 w-[240px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setSelectedDate(new Date(e.target.value + "T12:00:00"));
                                    }
                                }}
                            />
                        </div>

                        <Button variant="ghost" size="icon" onClick={nextDay}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="relative min-h-[300px]">
                    {filteredSchedule.length > 0 ? (
                        <DailySchedule
                            items={filteredSchedule}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>Nenhuma rotina cadastrada para esta data e turma.</p>
                            <Button variant="link" onClick={() => setIsBulkDialogOpen(true)}>
                                Criar rotina em massa
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <ScheduleDialog
                key={editingItem?.id || 'new'}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                item={editingItem}
                onSave={handleSave}
            />

            <BulkRoutineDialog
                open={isBulkDialogOpen}
                onOpenChange={setIsBulkDialogOpen}
                defaultClassId={selectedClassId}
            />
        </div>
    );
}

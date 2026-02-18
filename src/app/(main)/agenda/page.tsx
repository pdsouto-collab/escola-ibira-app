
"use client";

import { useState } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailySchedule } from "@/components/agenda/daily-schedule";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { ScheduleDialog } from "@/components/agenda/schedule-dialog";
import { ScheduleItem } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
    const { schedule, classes, currentUser, updateSchedule } = useAppStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

    // Filter Logic
    const availableClasses = currentUser?.role === "teacher"
        ? classes.filter(c => c.teacherId === currentUser.id)
        : classes;

    const filteredSchedule = schedule.filter(item => {
        // Assume items without date are "daily" for now, or match date
        const itemDateMatches = item.date ? isSameDay(new Date(item.date), currentDate) : true;

        const classMatches = selectedClassId === "all"
            ? (currentUser?.role === "teacher" ? availableClasses.some(c => c.id === item.classId) : true)
            : item.classId === selectedClassId;

        return itemDateMatches && classMatches;
    });

    const handleAdd = () => {
        setEditingItem(null);
        setIsScheduleDialogOpen(true);
    };

    const handleEdit = (item: ScheduleItem) => {
        setEditingItem(item);
        setIsScheduleDialogOpen(true);
    };

    const handleDelete = (item: ScheduleItem) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Remover este item da agenda?")) {
            updateSchedule(schedule.filter(i => i.id !== item.id));
        }
    };

    const handleSave = (item: ScheduleItem) => {
        const newItem = {
            ...item,
            classId: selectedClassId === "all" ? availableClasses[0]?.id : selectedClassId,
            date: item.date || format(currentDate, 'yyyy-MM-dd')
        };

        if (editingItem) {
            updateSchedule(schedule.map(i => i.id === item.id ? newItem : i));
        } else {
            updateSchedule([...schedule, newItem]);
        }
    };

    const canEdit = ["admin", "director", "teacher"].includes(currentUser?.role || "");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("min-w-[240px] justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(currentDate, "PPP", { locale: ptBR })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            {/* @ts-ignore */}
                            <Calendar mode="single" selected={currentDate} onSelect={(date: any) => date && setCurrentDate(date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {canEdit && (
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione a turma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as turmas</SelectItem>
                                {availableClasses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {canEdit && (
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" /> Novo Item
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    Agenda do Dia
                    {selectedClassId !== "all" && <span className="text-slate-500 text-base font-normal">- {classes.find(c => c.id === selectedClassId)?.name}</span>}
                </h2>

                {filteredSchedule.length > 0 ? (
                    <DailySchedule items={filteredSchedule.sort((a, b) => a.time.localeCompare(b.time))} onEdit={canEdit ? handleEdit : undefined} onDelete={canEdit ? handleDelete : undefined} />
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        Nenhum item agendado para este dia/turma.
                    </div>
                )}
            </div>

            <ScheduleDialog
                open={isScheduleDialogOpen}
                onOpenChange={setIsScheduleDialogOpen}
                item={editingItem}
                onSave={handleSave}
            />
        </div>
    );
}

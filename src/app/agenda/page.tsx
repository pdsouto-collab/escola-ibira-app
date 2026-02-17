"use client";

import { useState } from "react";
import { DailySchedule } from "@/components/agenda/daily-schedule";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScheduleDialog } from "@/components/agenda/schedule-dialog";
import { ScheduleItem } from "@/lib/data";

export default function AgendaPage() {
    const { schedule, updateSchedule } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

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
        let newSchedule: ScheduleItem[];
        if (editingItem) {
            newSchedule = schedule.map(i => i.id === item.id ? item : i);
        } else {
            newSchedule = [...schedule, item];
        }
        // Sort by time
        newSchedule.sort((a, b) => a.time.localeCompare(b.time));
        updateSchedule(newSchedule);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Agenda Digital</h1>
                    <p className="text-slate-500">Acompanhe a rotina diária e atividades.</p>
                </div>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Item
                </Button>
            </div>

            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Rotina de Hoje</h2>
                    <span className="text-sm text-slate-500 capitalize">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>

                <DailySchedule
                    items={schedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <ScheduleDialog
                key={editingItem?.id || 'new'}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                item={editingItem}
                onSave={handleSave}
            />
        </div>
    );
}

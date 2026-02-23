import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { CalendarDays, Users, FolderKanban } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function WeeklyView() {
    const { schedule, classes } = useAppStore();
    const [selectedClassId, setSelectedClassId] = useState<string>(classes.length > 0 ? classes[0].id : "");

    // Fallback if selectedClassId becomes invalid
    if (!selectedClassId && classes.length > 0) {
        setSelectedClassId(classes[0].id);
    }

    // Generate days for the current week (Mon-Fri)
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 5 }).map((_, i) => {
        const date = addDays(weekStart, i);
        return {
            date: date,
            label: format(date, "EEEE", { locale: ptBR }),
            dayNumber: format(date, "d"),
            fullDate: format(date, "yyyy-MM-dd"),
            active: isSameDay(today, date)
        };
    });

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "activity": return "bg-white border-l-4 border-l-blue-400 text-slate-700";
            case "meal": return "bg-white border-l-4 border-l-emerald-400 text-slate-700";
            case "care": return "bg-white border-l-4 border-l-amber-400 text-slate-700";
            case "project": return "bg-violet-50 border-l-4 border-l-violet-500 text-violet-900";
            default: return "bg-white border text-slate-800";
        }
    };

    const getItemsForDay = (dateStr: string) => {
        return schedule
            .filter(item => {
                if (item.date !== dateStr) return false;
                // Project sessions (have projectId but no classId) always show
                if (item.projectId && !item.classId) return true;
                return item.classId === selectedClassId;
            })
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-slate-600" />
                    <h2 className="text-xl font-bold text-slate-800">Rotina Semanal</h2>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Users className="w-4 h-4 text-slate-500" />
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-white">
                            <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weekDays.map((day) => {
                    const items = getItemsForDay(day.fullDate);

                    return (
                        <div key={day.fullDate} className={`flex flex-col gap-3 p-3 rounded-xl border ${day.active ? 'bg-slate-50 border-slate-200 shadow-sm ring-1 ring-slate-200' : 'bg-transparent border-transparent'}`}>
                            <div className="text-center mb-1">
                                <div className={`text-xs uppercase font-bold tracking-wider mb-1 ${day.active ? 'text-primary' : 'text-slate-400'}`}>
                                    {day.label.split('-')[0]}
                                </div>
                                <div className={`text-xl font-bold ${day.active ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {day.dayNumber}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`p-2 rounded-md shadow-sm text-xs ${getTypeStyles(item.type)}`}
                                        >
                                            <div className="flex justify-between items-start gap-1 mb-0.5">
                                                <span className="font-semibold line-clamp-1">{item.title}</span>
                                                {item.type === "project" && <FolderKanban className="w-3 h-3 text-violet-500 shrink-0 mt-0.5" />}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono">
                                                {item.time} {item.endTime ? `- ${item.endTime}` : ''}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 px-2 border-2 border-dashed border-slate-100 rounded-lg">
                                        <span className="text-xs text-slate-300">Sem atividades</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

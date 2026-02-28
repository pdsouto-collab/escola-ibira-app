"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { DailyLog, Student, ScheduleItem } from "@/lib/data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DailyLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date;
    classId: string;
}

// Helper types
type Mood = "happy" | "neutral" | "sad" | "tired" | "excited";
type MealAmount = "all" | "most" | "some" | "none";

interface StudentLogForm {
    studentId: string;
    present: boolean;
    mood: Mood;
    breakfast: MealAmount;
    lunch: MealAmount;
    snack: MealAmount;
    napStart: string;
    napEnd: string;
    didNotNap: boolean;
    notes: string;
}

export function DailyLogDialog({ open, onOpenChange, date, classId }: DailyLogDialogProps) {
    const { students, schedule, addDailyLog, dailyLogs, updateDailyLog, removeDailyLog, menus } = useAppStore();

    const [forms, setForms] = useState<Record<string, StudentLogForm>>({});
    const [selectedActivities, setSelectedActivities] = useState<Record<string, boolean>>({});

    // 1. Get students for this class
    const classStudents = students.filter(s => s.classId === classId);

    // 2. Get activities for today and this class to populate "Atividades Realizadas"
    const dateStr = format(date, "yyyy-MM-dd");

    // We get activities that match the selected date. Note: generic routine items in `mockSchedule` may not have a date.
    // For this mock, we'll consider ANY activity in schedule as "today's routine" if date is null, or matching date.
    // In a real app, schedule items with dates are used. Let's pull everything that matches classId.
    const todaysActivities = schedule.filter(item => {
        const matchesClass = item.classId === classId || !item.classId;
        const matchesType = item.type === "activity" || item.type === "project"; // Only activities/projects, not meals/care
        const matchesDate = !item.date || item.date === dateStr;
        return matchesClass && matchesType && matchesDate;
    });

    const todaysMenu = menus.find(m => m.date === dateStr);
    const getMenuDescription = (title: string) => {
        return todaysMenu?.items.find(item => item.title === title)?.description || "";
    };

    // Form initialization and merging with existing logs for today
    useEffect(() => {
        if (!open) return;

        const newForms: Record<string, StudentLogForm> = {};

        // Find existing logs for today
        const existingLogs = dailyLogs.filter(log => log.date === dateStr);
        const hasLogsForToday = existingLogs.length > 0;

        classStudents.forEach(student => {
            const existing = existingLogs.find(l => l.studentId === student.id);

            if (existing) {
                newForms[student.id] = {
                    studentId: student.id,
                    present: true,
                    mood: existing.mood,
                    breakfast: existing.meals.breakfast,
                    lunch: existing.meals.lunch,
                    snack: existing.meals.snack,
                    napStart: existing.nap.start,
                    napEnd: existing.nap.end,
                    didNotNap: existing.nap.didNotNap !== undefined ? existing.nap.didNotNap : true,
                    notes: existing.notes,
                };
            } else {
                newForms[student.id] = {
                    studentId: student.id,
                    present: !hasLogsForToday, // If logs exist for today but not for this student, they were marked absent
                    mood: "happy",
                    breakfast: "all",
                    lunch: "all",
                    snack: "all",
                    napStart: "13:00",
                    napEnd: "14:30",
                    didNotNap: true,
                    notes: "",
                };
            }
        });

        setForms(newForms);

        // Pre-select all activities by default
        const newSelectedActivities: Record<string, boolean> = {};
        todaysActivities.forEach(act => {
            newSelectedActivities[act.id] = true;
        });
        setSelectedActivities(newSelectedActivities);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, dateStr, classId]);

    const handleSave = () => {
        // Collect checked activity titles
        const checkedActivities = todaysActivities
            .filter(act => selectedActivities[act.id])
            .map(act => act.title);

        const existingLogs = dailyLogs.filter(log => log.date === dateStr);

        classStudents.forEach(student => {
            const form = forms[student.id];
            const existingLog = existingLogs.find(l => l.studentId === student.id);

            if (!form || !form.present) {
                if (existingLog) removeDailyLog(existingLog.id);
                return; // Skip absent students
            }

            const logData: DailyLog = {
                id: `log-${Date.now()}-${student.id}`,
                studentId: student.id,
                date: dateStr,
                mood: form.mood,
                meals: {
                    breakfast: form.breakfast,
                    lunch: form.lunch,
                    snack: form.snack,
                },
                nap: {
                    start: form.didNotNap ? "" : form.napStart,
                    end: form.didNotNap ? "" : form.napEnd,
                    didNotNap: form.didNotNap,
                },
                activities: checkedActivities,
                notes: form.notes,
            };

            if (existingLog) {
                updateDailyLog(existingLog.id, logData);
            } else {
                addDailyLog(logData);
            }
        });

        onOpenChange(false);
    };

    const fillAllDefaults = () => {
        setForms(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(studentId => {
                if (next[studentId].present) {
                    next[studentId] = {
                        ...next[studentId],
                        mood: "happy",
                        breakfast: "all",
                        lunch: "all",
                        snack: "all",
                        didNotNap: true,
                    };
                }
            });
            return next;
        });
    };

    const updateForm = (studentId: string, updates: Partial<StudentLogForm>) => {
        setForms(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], ...updates }
        }));
    };

    const translationMeal = {
        all: "Tudo",
        most: "Maioria",
        some: "Pouco",
        none: "Nada"
    };

    const renderMealSelector = (studentId: string, mealType: "breakfast" | "lunch" | "snack", currentValue: MealAmount) => {
        const options: MealAmount[] = ["all", "most", "some", "none"];
        return (
            <div className="flex gap-1 mt-1">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => updateForm(studentId, { [mealType]: opt })}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${currentValue === opt
                            ? (opt === "all" ? "bg-green-100 text-green-700 border-green-200"
                                : opt === "most" ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : opt === "some" ? "bg-orange-100 text-orange-700 border-orange-200"
                                        : "bg-red-100 text-red-700 border-red-200")
                            : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                            }`}
                    >
                        {translationMeal[opt]}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-xl">Diário de Bordo em Lote</DialogTitle>
                            <DialogDescription>
                                {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </DialogDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fillAllDefaults} className="ml-auto">
                            Preencher Padrão (Tudo/Feliz)
                        </Button>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {/* ACTIVITIES BLOCK */}
                    <div className="mb-6 bg-slate-50 border p-4 rounded-lg">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Atividades e Projetos do Dia
                        </Label>
                        <p className="text-xs text-muted-foreground mb-3">
                            Marque o que realmente aconteceu hoje. Isso será registrado no portfólio de todos os alunos presentes.
                        </p>

                        {todaysActivities.length === 0 ? (
                            <p className="text-xs italic text-slate-500">Nenhuma atividade de projeto/rotina cadastrada para esta turma hoje.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {todaysActivities.map(act => (
                                    <div key={act.id} className="flex flex-row items-center space-x-3 p-2 bg-white rounded border">
                                        <Checkbox
                                            id={`act-${act.id}`}
                                            checked={selectedActivities[act.id] || false}
                                            onCheckedChange={(c) => setSelectedActivities(prev => ({ ...prev, [act.id]: !!c }))}
                                        />
                                        <div className="flex flex-col">
                                            <Label htmlFor={`act-${act.id}`} className="font-medium cursor-pointer">{act.title}</Label>
                                            <span className="text-[10px] text-muted-foreground">{act.time} {act.endTime ? `- ${act.endTime}` : ''}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* STUDENTS GRID */}
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-slate-700">Preenchimento Individual</Label>

                        {classStudents.map(student => {
                            const form = forms[student.id];
                            if (!form) return null;

                            return (
                                <div key={student.id} className={`flex flex-col md:flex-row gap-4 p-3 border rounded-lg transition-colors ${!form.present ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                                    {/* Present Toggle & Avatar */}
                                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.photo} alt={student.name} />
                                            <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-xs font-medium text-center leading-tight truncate w-full">{student.name.split(" ")[0]}</div>
                                        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md px-2 mt-1">
                                            <Checkbox
                                                checked={form.present}
                                                onCheckedChange={(c) => updateForm(student.id, { present: !!c })}
                                                id={`present-${student.id}`}
                                            />
                                            <Label htmlFor={`present-${student.id}`} className="text-[10px] cursor-pointer">
                                                Presente
                                            </Label>
                                        </div>
                                    </div>

                                    {form.present && (
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                            {/* Humor */}
                                            <div className="md:col-span-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Humor</Label>
                                                <div className="flex gap-1 text-lg">
                                                    <button onClick={() => updateForm(student.id, { mood: "happy" })} className={form.mood === "happy" ? "opacity-100 scale-125" : "opacity-40 hover:opacity-100 grayscale"}>😊</button>
                                                    <button onClick={() => updateForm(student.id, { mood: "excited" })} className={form.mood === "excited" ? "opacity-100 scale-125" : "opacity-40 hover:opacity-100 grayscale"}>🤩</button>
                                                    <button onClick={() => updateForm(student.id, { mood: "neutral" })} className={form.mood === "neutral" ? "opacity-100 scale-125" : "opacity-40 hover:opacity-100 grayscale"}>😐</button>
                                                    <button onClick={() => updateForm(student.id, { mood: "tired" })} className={form.mood === "tired" ? "opacity-100 scale-125" : "opacity-40 hover:opacity-100 grayscale"}>🥱</button>
                                                    <button onClick={() => updateForm(student.id, { mood: "sad" })} className={form.mood === "sad" ? "opacity-100 scale-125" : "opacity-40 hover:opacity-100 grayscale"}>😢</button>
                                                </div>
                                            </div>

                                            {/* Meals */}
                                            <div className="md:col-span-5 grid grid-cols-1 gap-2 border-l border-r px-4 border-slate-100">
                                                <div>
                                                    <div className="flex flex-col mb-1">
                                                        <Label className="text-[10px] text-indigo-600 font-bold uppercase">Lanche da Manhã</Label>
                                                        <p className="text-[9px] text-slate-400 leading-tight">{getMenuDescription("Lanche da Manhã") || "Cardápio não definido"}</p>
                                                    </div>
                                                    {renderMealSelector(student.id, "breakfast", form.breakfast)}
                                                </div>
                                                <div>
                                                    <div className="flex flex-col mb-1">
                                                        <Label className="text-[10px] text-indigo-600 font-bold uppercase">Almoço</Label>
                                                        <p className="text-[9px] text-slate-400 leading-tight">{getMenuDescription("Almoço") || "Cardápio não definido"}</p>
                                                    </div>
                                                    {renderMealSelector(student.id, "lunch", form.lunch)}
                                                </div>
                                                <div>
                                                    <div className="flex flex-col mb-1">
                                                        <Label className="text-[10px] text-indigo-600 font-bold uppercase">Lanche da Tarde</Label>
                                                        <p className="text-[9px] text-slate-400 leading-tight">{getMenuDescription("Lanche da Tarde") || "Cardápio não definido"}</p>
                                                    </div>
                                                    {renderMealSelector(student.id, "snack", form.snack)}
                                                </div>
                                            </div>

                                            {/* Sono & Observações */}
                                            <div className="md:col-span-5 flex flex-col gap-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] text-muted-foreground">Sono</Label>
                                                        <div className="flex items-center gap-1">
                                                            <Checkbox
                                                                id={`nonap-${student.id}`}
                                                                checked={form.didNotNap}
                                                                onCheckedChange={(c) => updateForm(student.id, { didNotNap: !!c })}
                                                            />
                                                            <Label htmlFor={`nonap-${student.id}`} className="text-[10px] text-slate-500 cursor-pointer">Não dormiu</Label>
                                                        </div>
                                                    </div>
                                                    {!form.didNotNap && (
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <Label className="text-[10px] text-muted-foreground block">Início</Label>
                                                                <Input type="time" className="h-7 text-xs px-2" value={form.napStart} onChange={(e) => updateForm(student.id, { napStart: e.target.value })} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label className="text-[10px] text-muted-foreground block">Fim</Label>
                                                                <Input type="time" className="h-7 text-xs px-2" value={form.napEnd} onChange={(e) => updateForm(student.id, { napEnd: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <Input
                                                        placeholder="Observação do dia (Opcional)..."
                                                        className="h-7 text-xs px-2 bg-amber-50 placeholder:text-amber-700/50 border-amber-200"
                                                        value={form.notes}
                                                        onChange={(e) => updateForm(student.id, { notes: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </ScrollArea>

                <DialogFooter className="p-4 border-t bg-slate-50">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Diário de Bordo da Turma</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

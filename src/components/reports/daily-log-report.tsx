"use client";

import { mockDailyLogs } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Utensils, Moon, Smile, Meh, Frown, Sparkles } from "lucide-react";

interface DailyLogReportProps {
    studentId: string;
}

export function DailyLogReport({ studentId }: DailyLogReportProps) {
    // Determine today's date or filter by available log. For mock purposes, we get the first log for the student or null.
    const log = mockDailyLogs.find(l => l.studentId === studentId);

    if (!log) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>Nenhum registro diário encontrado para hoje.</p>
            </div>
        );
    }

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case "happy": return <Smile className="w-8 h-8 text-green-500" />;
            case "excited": return <Sparkles className="w-8 h-8 text-yellow-500" />;
            case "sad": return <Frown className="w-8 h-8 text-blue-500" />;
            default: return <Meh className="w-8 h-8 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        Diário de {log.date.split("-").reverse().join("/")}
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium uppercase text-slate-600">Humor:</span>
                        {getMoodIcon(log.mood)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Meals Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Utensils className="w-4 h-4" /> Alimentação
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <MealCard title="Lanche Manhã" status={log.meals.breakfast} />
                            <MealCard title="Almoço" status={log.meals.lunch} />
                            <MealCard title="Lanche Tarde" status={log.meals.snack} />
                        </div>
                    </div>

                    {/* Nap Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Moon className="w-4 h-4" /> Sono / Descanso
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4 text-blue-800">
                            <span className="font-semibold">Dorme:</span> {log.nap.start} às {log.nap.end}
                        </div>
                    </div>

                    {/* Activities */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 text-slate-600">Atividades Realizadas</h3>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                            {log.activities.map((act, i) => (
                                <li key={i}>{act}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Notes */}
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-900 italic">
                        "{log.notes}"
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MealCard({ title, status }: { title: string, status: string }) {
    const getStatusText = (s: string) => {
        const map: any = { "all": "Tudo", "most": "Maioria", "some": "Pouco", "none": "Nada" };
        return map[s] || s;
    };

    const getStatusColor = (s: string) => {
        const map: any = { "all": "bg-green-100 text-green-700", "most": "bg-blue-100 text-blue-700", "some": "bg-orange-100 text-orange-700", "none": "bg-red-100 text-red-700" };
        return map[s] || "bg-slate-100 text-slate-700";
    };

    return (
        <div className="text-center p-3 rounded-lg border bg-white">
            <div className="text-xs text-slate-500 mb-1">{title}</div>
            <div className={`text-sm font-bold px-2 py-1 rounded-full inline-block ${getStatusColor(status)}`}>
                {getStatusText(status)}
            </div>
        </div>
    )
}

"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Utensils, Moon, Smile, Meh, Frown, Sparkles, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyLogReportProps {
    studentId: string;
    onEdit?: (date: string) => void;
}

export function DailyLogReport({ studentId, onEdit }: DailyLogReportProps) {
    const { dailyLogs, menus } = useAppStore();

    const logs = dailyLogs
        .filter(l => l.studentId === studentId)
        .sort((a, b) => b.date.localeCompare(a.date));

    if (logs.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <p>Nenhum registro diário encontrado para este aluno.</p>
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
        <div className="space-y-6 w-full">
            {logs.map(log => (
                <Card key={log.id} className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            Diário de {log.date.split("-").reverse().join("/")}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium uppercase text-slate-600">Humor:</span>
                                {getMoodIcon(log.mood)}
                            </div>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => onEdit(log.date)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Meals Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Utensils className="w-4 h-4" /> Alimentação
                            </h3>
                            {(() => {
                                const currentMenu = menus.find(m => m.date === log.date);
                                const getDesc = (t: string) => currentMenu?.items.find(i => i.title === t)?.description || "";
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <MealCard title="Lanche Manhã" description={getDesc("Lanche da Manhã")} status={log.meals.breakfast} />
                                        <MealCard title="Almoço" description={getDesc("Almoço")} status={log.meals.lunch} />
                                        <MealCard title="Lanche Tarde" description={getDesc("Lanche da Tarde")} status={log.meals.snack} />
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Nap Section */}
                        {(log.nap.start || log.nap.end || log.nap.didNotNap) && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Moon className="w-4 h-4" /> Sono / Descanso
                                </h3>
                                <div className={`p-4 rounded-lg flex items-center gap-4 ${log.nap.didNotNap ? 'bg-slate-50 text-slate-500 border border-slate-100 italic' : 'bg-blue-50 text-blue-800'}`}>
                                    <span className="font-semibold">
                                        {log.nap.didNotNap ? "Não dormiu hoje." : `Dormiu das ${log.nap.start || "--:--"} às ${log.nap.end || "--:--"}`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Activities */}
                        {log.activities.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-slate-500" /> Atividades Realizadas
                                </h3>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    {log.activities.map((act, i) => (
                                        <li key={i}>{act}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Notes and Missing Items */}
                        {(log.notes || log.missingItems) && (
                            <div className="space-y-4">
                                {log.notes && (
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">1. Observação do Dia</h4>
                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-900 italic">
                                            &quot;{log.notes}&quot;
                                        </div>
                                    </div>
                                )}
                                {log.missingItems && (
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">2. Enviar Itens Abaixo</h4>
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 italic">
                                            &quot;{log.missingItems}&quot;
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function MealCard({ title, description, status }: { title: string, description: string, status: string }) {
    const getStatusText = (s: string) => {
        const map: Record<string, string> = { "all": "Tudo", "most": "Maioria", "some": "Pouco", "none": "Nada" };
        return map[s] || s;
    };

    const getStatusColor = (s: string) => {
        const map: Record<string, string> = { "all": "bg-green-100 text-green-700", "most": "bg-blue-100 text-blue-700", "some": "bg-orange-100 text-orange-700", "none": "bg-red-100 text-red-700" };
        return map[s] || "bg-slate-100 text-slate-700";
    };

    return (
        <div className="text-center p-3 rounded-xl border bg-white flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">{title}</div>
            {description && (
                <div className="text-[10px] text-slate-400 leading-tight mb-2 italic">
                    {description}
                </div>
            )}
            <div className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(status)}`}>
                {getStatusText(status)}
            </div>
        </div>
    )
}

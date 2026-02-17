"use client";
import { useAppStore } from "@/lib/store";
import { ArrowRight, BookOpen, Calendar, Calculator, FlaskConical, CheckCircle2, Circle } from "lucide-react";
import { Button } from "../ui/button";

export function DailyHighlights() {
    const { tasks, toggleTask } = useAppStore();

    // Filter only pending tasks for the dashboard
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high": return { bg: "bg-red-50 border-red-100", iconBg: "bg-red-200 text-red-700", icon: FlaskConical };
            case "medium": return { bg: "bg-amber-50 border-amber-100", iconBg: "bg-amber-200 text-amber-700", icon: Calculator };
            case "low": return { bg: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-200 text-emerald-700", icon: BookOpen };
            default: return { bg: "bg-slate-50 border-slate-100", iconBg: "bg-slate-200 text-slate-700", icon: BookOpen };
        }
    };

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Pendências e Atividades</h2>
                <Button variant="outline" size="sm" className="gap-2">
                    Adicionar nova
                </Button>
            </div>

            {pendingTasks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-xl text-slate-400">
                    Nenhuma pendência para hoje! 🎉
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingTasks.map((task) => {
                        const styles = getPriorityStyles(task.priority);
                        const Icon = styles.icon;

                        return (
                            <div
                                key={task.id}
                                className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${styles.bg}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-lg ${styles.iconBg}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 bg-white/60 px-2 py-1 rounded capitalize">
                                        Prioridade {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                                    {task.title}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                                    {task.dueDate ? `Vencimento: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}` : "Sem data definida"}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/50">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-green-600 transition-colors"
                                    >
                                        <Circle className="w-4 h-4" />
                                        Concluir
                                    </button>
                                    <Button size="sm" variant="secondary" className="h-7 text-xs px-3">
                                        Detalhes
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

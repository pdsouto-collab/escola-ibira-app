"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ArrowRight, BookOpen, Calendar, Calculator, FlaskConical, CheckCircle2, Circle, Clock, User, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Task } from "@/lib/data";

export function DailyHighlights() {
    const { tasks, toggleTask, addTask } = useAppStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [newTask, setNewTask] = useState<{ title: string; priority: "low" | "medium" | "high"; dueDate: string }>({
        title: "",
        priority: "medium",
        dueDate: ""
    });

    const handleCreateTask = () => {
        if (!newTask.title.trim()) return;

        const task: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTask.title,
            priority: newTask.priority,
            dueDate: newTask.dueDate || undefined,
            completed: false
        };

        addTask(task);
        setIsAddDialogOpen(false);
        setNewTask({ title: "", priority: "medium", dueDate: "" });
    };

    const openDetails = (task: Task) => {
        setSelectedTask(task);
        setIsDetailsDialogOpen(true);
    };

    // Filter only pending tasks for the dashboard
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high": return { bg: "bg-red-50 border-red-100", iconBg: "bg-red-200 text-red-700", icon: FlaskConical, label: "Alta" };
            case "medium": return { bg: "bg-amber-50 border-amber-100", iconBg: "bg-amber-200 text-amber-700", icon: Calculator, label: "Média" };
            case "low": return { bg: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-200 text-emerald-700", icon: BookOpen, label: "Baixa" };
            default: return { bg: "bg-slate-50 border-slate-100", iconBg: "bg-slate-200 text-slate-700", icon: BookOpen, label: "Normal" };
        }
    };

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Pendências e Atividades</h2>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
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
                                className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${styles.bg} flex flex-col`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-lg ${styles.iconBg}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 bg-white/60 px-2 py-1 rounded capitalize">
                                        Prioridade {styles.label}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                                    {task.title}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                                    {task.dueDate ? `Vencimento: ${new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : "Sem data definida"}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/50 w-full">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-green-600 transition-colors"
                                    >
                                        <Circle className="w-4 h-4" />
                                        Concluir
                                    </button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-7 text-xs px-3"
                                        onClick={() => openDetails(task)}
                                    >
                                        Detalhes
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dialog Adicionar Tarefa */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                        <DialogDescription>
                            Crie uma nova pendência ou atividade para acompanhar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="Ex: Preparar relatório bimestral"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select
                                    value={newTask.priority}
                                    onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baixa</SelectItem>
                                        <SelectItem value="medium">Média</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Data de Vencimento</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateTask}>Adicionar Tarefa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Detalhes da Tarefa */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes da Tarefa</DialogTitle>
                    </DialogHeader>

                    {selectedTask && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{selectedTask.title}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${selectedTask.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                            selectedTask.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        Prioridade {selectedTask.priority === 'high' ? 'Alta' : selectedTask.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </span>
                                    {selectedTask.dueDate && (
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(selectedTask.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div className="text-sm text-slate-600">
                                        <p>Esta tarefa ainda está pendente. Certifique-se de completá-la antes do prazo.</p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    className="w-full sm:w-auto"
                                    variant="outline"
                                    onClick={() => {
                                        toggleTask(selectedTask.id);
                                        setIsDetailsDialogOpen(false);
                                    }}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Marcar como Concluída
                                </Button>
                                <Button
                                    className="w-full sm:w-auto"
                                    variant="secondary"
                                    onClick={() => setIsDetailsDialogOpen(false)}
                                >
                                    Fechar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

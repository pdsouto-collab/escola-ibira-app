"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, FlaskConical, Calculator, BookOpen, Clock, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Task } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PendenciasPage() {
    const { tasks, addTask, toggleTask, removeTask } = useAppStore();
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

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "high": return { bg: "bg-red-50 text-red-700 border-red-200", icon: FlaskConical, label: "Alta" };
            case "medium": return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Calculator, label: "Média" };
            case "low": return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: BookOpen, label: "Baixa" };
            default: return { bg: "bg-slate-50 text-slate-700 border-slate-200", icon: BookOpen, label: "Normal" };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Pendências
                    </h1>
                    <p className="text-slate-500">
                        Gerencie suas tarefas e pendências escolares.
                    </p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Pendência
                </Button>
            </div>

            <div className="rounded-xl border bg-white shadow-sm">
                <div className="divide-y">
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            Nenhuma pendência encontrada.
                        </div>
                    ) : (
                        tasks.map((item) => {
                            const priorityStyle = getPriorityStyles(item.priority);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <button
                                            onClick={() => toggleTask(item.id)}
                                            className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </button>
                                        <div className="flex flex-col gap-1">
                                            <span
                                                className={`text-sm ${item.completed
                                                    ? "text-slate-400 line-through"
                                                    : "text-slate-900 font-medium"
                                                    }`}
                                            >
                                                {item.title}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${priorityStyle.bg}`}>
                                                    {priorityStyle.label}
                                                </span>
                                                {item.dueDate && (
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(item.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => openDetails(item)}>
                                            Detalhes
                                        </Button>
                                        <button
                                            onClick={() => removeTask(item.id)}
                                            className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                            aria-label="Excluir"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dialog Adicionar */}
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

            {/* Dialog Detalhes */}
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
                                        <p>{selectedTask.completed ? "Tarefa concluída." : "Esta tarefa ainda está pendente."}</p>
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
                                    {selectedTask.completed ? <Circle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    {selectedTask.completed ? "Marcar como Pendente" : "Marcar como Concluída"}
                                </Button>
                                <Button
                                    className="w-full sm:w-auto"
                                    variant="destructive"
                                    onClick={() => {
                                        removeTask(selectedTask.id);
                                        setIsDetailsDialogOpen(false);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
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
        </div>
    );
}

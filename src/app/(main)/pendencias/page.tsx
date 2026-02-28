"use client";

import { useState } from "react";
import {
    Plus, Trash2, CheckCircle2, Circle, FlaskConical, Calculator,
    BookOpen, Clock, AlertCircle, MessageSquare, GraduationCap,
    Calendar, ChevronRight, NotebookPen, Info, Star
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Task, SchoolClass } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyLogDialog } from "@/components/agenda/daily-log-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PendenciasPage() {
    const { tasks, addTask, toggleTask, removeTask, currentUser, dailyLogs, classes } = useAppStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Diário de Bordo Integration
    const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
    const [activeClassId, setActiveClassId] = useState<string | null>(null);

    const [newTask, setNewTask] = useState<{ title: string; priority: "low" | "medium" | "high"; dueDate: string }>({
        title: "",
        priority: "medium",
        dueDate: ""
    });

    const isTeacher = currentUser?.role === "teacher";
    const today = new Date().toISOString().split('T')[0];

    // Get teacher classes and their log status
    const teacherClasses = isTeacher
        ? classes.filter(c => currentUser.assignedClassIds?.includes(c.id))
        : [];

    const classesNeedingLog = teacherClasses.filter(c => {
        // Simple check: does any log exist for this class on this date?
        // Note: logs are per-student in the real data structure, 
        // but often we want to see if the CLASS log flow was started.
        const classLogs = dailyLogs.filter(l => l.date === today && l.studentId);
        // For simplicity in this demo, if there are NO logs for any student in this class today, it's missing.
        // We'll need a better heuristic, but let's assume if 0 students have logs, then it's a priority.
        // To be safe, let's just show it as a daily "Routine" task.
        return true;
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
                        Painel Estratégico
                    </h1>
                    <p className="text-slate-500">
                        Visão geral de suas responsabilidades e ações prioritárias.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/agenda'} className="hidden sm:flex gap-2">
                        <Calendar className="h-4 w-4" />
                        Ver Agenda
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Tarefa
                    </Button>
                </div>
            </div>

            {/* Ações Estratégicas / Quick Actions */}
            {isTeacher && teacherClasses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Diário de Bordo Card */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-5 text-white shadow-lg overflow-hidden relative group">
                        <NotebookPen className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px]">ROTINA DIÁRIA</Badge>
                                <span className="text-[10px] text-indigo-100 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date().toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold mb-1">Diário de Bordo</h2>
                            <p className="text-indigo-100 text-sm mb-4">Registre as vivências, humor e rotina das suas turmas hoje.</p>

                            <div className="space-y-2">
                                {teacherClasses.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setActiveClassId(c.id);
                                            setIsDailyLogOpen(true);
                                        }}
                                        className="w-full bg-white/10 hover:bg-white/20 py-2 px-3 rounded-lg text-sm flex items-center justify-between transition-colors border border-white/10"
                                    >
                                        <span className="font-medium">Registrar para {c.name}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Messages/Communication Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">3 Não Lidas</Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">Comunicação</h3>
                        <p className="text-slate-500 text-sm mb-4">Há novas mensagens de responsáveis que precisam de atenção.</p>
                        <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-100 hover:bg-blue-50" onClick={() => window.location.href = '/mensagens'}>
                            Ir para Mensagens
                        </Button>
                    </div>

                    {/* Performance/Evaluations Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Star className="w-5 h-5 text-emerald-600" />
                            </div>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">80% Meta</Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">Avaliações</h3>
                        <p className="text-slate-500 text-sm mb-4">5 alunos do {teacherClasses[0]?.name || 'Jardim'} ainda possuem evidências pendentes este mês.</p>
                        <Button variant="outline" size="sm" className="w-full text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={() => window.location.href = '/mosaico'}>
                            Ver Mosaico
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Lista de Tarefas Administrativas
                    </h2>
                    <div className="h-px bg-slate-100 flex-1" />
                </div>

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
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
                {/* Daily Log Dialog */}
                {activeClassId && (
                    <DailyLogDialog
                        key={`dash-log-${activeClassId}`}
                        open={isDailyLogOpen}
                        onOpenChange={setIsDailyLogOpen}
                        classId={activeClassId}
                        date={new Date()}
                    />
                )}
            </div>
        </div>
    );
}

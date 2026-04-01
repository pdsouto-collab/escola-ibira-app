"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus, Trash2, CheckCircle2, Circle, FlaskConical, Calculator,
    BookOpen, Clock, AlertCircle, MessageSquare, GraduationCap,
    Calendar, ChevronRight, NotebookPen, Info, Star, Loader2
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Task } from "@/types/task";
import { getTasks, createTask, toggleTask, deleteTask } from "@/services/task.service";
import { SchoolClass } from "@/types/school-class";
import { getClasses } from "@/services/school-class.service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyLogDialog } from "@/components/agenda/daily-log-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";


export default function PendenciasPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function fetchClasses() {
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoadingClasses(false);
        }
    }

    async function loadTasks() {
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            toast.error("Erro ao carregar lembretes");
        } finally {
            setIsLoadingTasks(false);
        }
    }

    useEffect(() => {
        fetchClasses();
        loadTasks();
    }, []);

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
        return true;
    });

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) return;
        setIsSubmitting(true);
        try {
            const task = await createTask({
                title: newTask.title,
                priority: newTask.priority,
                dueDate: newTask.dueDate || undefined,
                completed: false,
            });
            setTasks(prev => [task, ...prev]);
            setIsAddDialogOpen(false);
            setNewTask({ title: "", priority: "medium", dueDate: "" });
            toast.success("Tarefa criada com sucesso!");
        } catch (error) {
            toast.error("Erro ao criar tarefa");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleTask = async (task: Task) => {
        try {
            const updated = await toggleTask(task.id, !task.completed);
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
            toast.success(updated.completed ? "Tarefa concluída" : "Tarefa pendente");
            if (isDetailsDialogOpen && selectedTask?.id === task.id) {
                setSelectedTask(updated);
            }
        } catch (error) {
            toast.error("Erro ao alterar o status da tarefa");
        }
    };

    const handleRemoveTask = async (id: string) => {
        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            toast.success("Tarefa removida com sucesso");
            if (isDetailsDialogOpen && selectedTask?.id === id) {
                setIsDetailsDialogOpen(false);
            }
        } catch (error) {
            toast.error("Erro ao remover tarefa");
        }
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
                        Atividades Pendentes
                    </h1>
                    <p className="text-slate-500">
                        Visão geral de suas responsabilidades e ações prioritárias.
                    </p>
                </div>
            </div>

            {/* Ações Estratégicas / Quick Actions */}
            {isLoadingClasses ? (
                <div className="flex items-center justify-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin mr-3" />
                    <span className="text-slate-500 font-medium">Carregando informações das turmas...</span>
                </div>
            ) : isTeacher && teacherClasses.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">Tarefas e Mensagens</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Diário de Bordo Card */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#2E798A] to-[#256370] rounded-xl p-5 text-white shadow-lg overflow-hidden relative group">
                            <NotebookPen className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px]">ROTINA DIÁRIA</Badge>
                                    <span className="text-[10px] text-cyan-100 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date().toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold mb-1">Diário de Bordo</h2>
                                <p className="text-cyan-50 text-sm mb-4">Registre as vivências, humor e rotina das suas turmas hoje.</p>

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
                        <Link href="/conversas" className="block h-full">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#2E798A]/30 transition-all h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <MessageSquare className="w-5 h-5 text-[#2E798A]" />
                                    </div>
                                    <Badge variant="secondary" className="bg-[#2E798A]/10 text-[#2E798A]">3 Não Lidas</Badge>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">Comunicação</h3>
                                <p className="text-slate-500 text-sm mb-4">Há novas mensagens de responsáveis que precisam de atenção.</p>
                                <Button variant="outline" size="sm" className="w-full text-[#2E798A] border-[#2E798A]/20 hover:bg-[#2E798A]/5">
                                    Ir para Mensagens
                                </Button>
                            </div>
                        </Link>

                        {/* Performance/Evaluations Card */}
                        <Link href={`/portfolio${teacherClasses[0] ? `?classId=${teacherClasses[0].id}` : ""}`} className="block h-full">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <Star className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">80% Meta</Badge>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">Avaliações</h3>
                                <p className="text-slate-500 text-sm mb-4">5 alunos do {teacherClasses[0]?.name || 'Jardim'} ainda possuem evidências pendentes este mês.</p>
                                <Button variant="outline" size="sm" className="w-full text-emerald-600 border-emerald-100 hover:bg-emerald-50">
                                    Ver Portfólio
                                </Button>
                            </div>
                        </Link>
                    </div>
                </div>
            )
            }

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Lembretes
                        </h2>
                        <div className="h-px bg-slate-100 flex-1" />
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-2 border-slate-200 hover:bg-slate-50 shrink-0"
                        onClick={() => setIsAddDialogOpen(true)}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Novo
                    </Button>
                </div>

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden min-h-[100px]">
                    <div className="divide-y relative">
                        {isLoadingTasks ? (
                            <div className="flex items-center justify-center p-8 absolute inset-0 z-10 bg-white/50">
                                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                            </div>
                        ) : null}
                        
                        {tasks.length === 0 && !isLoadingTasks ? (
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
                                                onClick={() => handleToggleTask(item)}
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
                                                onClick={() => handleRemoveTask(item.id)}
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
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                            <Button onClick={handleCreateTask} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Adicionar Tarefa
                            </Button>
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
                                            handleToggleTask(selectedTask);
                                        }}
                                    >
                                        {selectedTask.completed ? <Circle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        {selectedTask.completed ? "Marcar como Pendente" : "Marcar como Concluída"}
                                    </Button>
                                    <Button
                                        className="w-full sm:w-auto"
                                        variant="destructive"
                                        onClick={() => {
                                            handleRemoveTask(selectedTask.id);
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
        </div >
    );
}

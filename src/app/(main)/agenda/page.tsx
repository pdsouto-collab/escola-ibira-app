"use client";
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailySchedule } from "@/components/agenda/daily-schedule";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Copy, Settings2, Loader2 } from "lucide-react";
import { ScheduleDialog } from "@/components/agenda/schedule-dialog";
import { BulkRoutineDialog, BulkRoutineConfig } from "@/components/agenda/bulk-routine-dialog";
import { RoutineManagerDialog } from "@/components/agenda/routine-manager-dialog";
import { DailyLogDialog } from "@/components/agenda/daily-log-dialog";
import { BulkPortfolioDialog } from "@/components/portfolio/bulk-portfolio-dialog";
import { ScheduleItem } from "@/types/schedule";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getClasses } from "@/services/school-class.service";
import { getStudents } from "@/services/student.service";
import { getProjects } from "@/services/project.service";
import { Student } from "@/types/student";
import { SchoolClass } from "@/types/school-class";
import { Project } from "@/types/project";
import { getSchedules, createSchedule as createScheduleService, updateSchedule as updateScheduleService, deleteSchedule as deleteScheduleService } from "@/services/schedule.service";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AgendaPage() {
    const { data: session } = useSession();
    const currentUser = session?.user as any;

    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
    const [bulkConfig, setBulkConfig] = useState<BulkRoutineConfig | undefined>();
    const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
    const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
    const [isBulkPortfolioOpen, setIsBulkPortfolioOpen] = useState(false);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState<ScheduleItem | null>(null);
    const [confirmDeleteRoutineId, setConfirmDeleteRoutineId] = useState<string | null>(null);
    const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);

    async function fetchData() {
        setIsLoadingData(true);
        try {
            const [classesData, studentsData, projectsData, scheduleData] = await Promise.all([
                getClasses(),
                getStudents(),
                getProjects(),
                getSchedules()
            ]);
            setClasses(classesData);
            setStudents(studentsData);
            setProjects(projectsData);
            setSchedule(scheduleData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados iniciais");
        } finally {
            setIsLoadingData(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const availableClasses = currentUser?.role === "teacher"
        ? classes.filter(c => c.teacherId === currentUser.id)
        : classes;

    const filteredSchedule = schedule.filter(item => {
        const todayStr = format(currentDate, 'yyyy-MM-dd');
        const itemDateMatches = item.date ? item.date === todayStr : true;

        const classMatches = selectedClassId === "all"
            ? (currentUser?.role === "teacher" ? availableClasses.some(c => c.id === item.classId) : true)
            : item.classId === selectedClassId || !item.classId;

        const typeMatches = selectedType === "all" || item.type === selectedType;

        return itemDateMatches && classMatches && typeMatches;
    });

    const handleAdd = () => {
        setEditingItem(null);
        setIsScheduleDialogOpen(true);
    };

    const handleEdit = (item: ScheduleItem) => {
        setEditingItem(item);
        setIsScheduleDialogOpen(true);
    };

    const handleDelete = (item: ScheduleItem) => {
        setConfirmDeleteItem(item);
    };

    const confirmDeleteAction = async () => {
        if (confirmDeleteItem) {
            try {
                await deleteScheduleService(confirmDeleteItem.id);
                setSchedule(schedule.filter(i => i.id !== confirmDeleteItem.id));
                toast.success("Item removido");
            } catch (err) {
                toast.error("Erro ao remover item");
            }
            setConfirmDeleteItem(null);
        }
    };

    const handleSave = async (item: ScheduleItem) => {
        const newItem = {
            ...item,
            classId: item.classId || (selectedClassId === "all" ? availableClasses[0]?.id : selectedClassId),
            date: item.date || format(currentDate, 'yyyy-MM-dd'),
            projectId: item.projectId
        };

        try {
            if (editingItem) {
                const updated = await updateScheduleService(item.id, newItem);
                setSchedule(schedule.map(i => i.id === item.id ? updated : i));
                toast.success("Atualizado com sucesso");
            } else {
                const created = await createScheduleService(newItem as any);
                setSchedule([...schedule, created]);
                toast.success("Adicionado com sucesso");
            }
        } catch (error) {
            toast.error("Erro ao salvar item da agenda");
        }
    };

    const canEdit = ["admin", "director", "teacher"].includes(currentUser?.role || "");

    const handleBulkCreateOptions = () => {
        setBulkConfig(undefined);
        setEditingRoutineId(null);
        setIsBulkDialogOpen(true);
    }

    const handleBulkSave = async (config: BulkRoutineConfig) => {
        let currentSchedule = schedule;

        toast.info("Criando rotina, aguarde...");

        const routineId = editingRoutineId || crypto.randomUUID();
        const start = new Date(config.startDate + "T00:00:00");
        const end = new Date(config.endDate + "T00:00:00");

        const newItems: Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">[] = [];

        const addItem = (date: Date, cId?: string) => {
            newItems.push({
                time: config.time,
                endTime: config.endTime || null,
                title: config.title,
                description: config.description || null,
                type: config.type,
                date: format(date, 'yyyy-MM-dd'),
                classId: cId || null,
                routineId: routineId,
                projectId: config.projectId || null
            });
        };

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (config.daysOfWeek.includes(d.getDay())) {
                if (config.classId === "all") {
                    availableClasses.forEach(c => addItem(new Date(d), c.id));
                } else {
                    addItem(new Date(d), config.classId);
                }
            }
        }

        try {
            if (editingRoutineId) {
                // Bulk delete old routine items using API is complex if we map one by one. 
                // We'll delete them one by one via service, then push new ones.
                const itemsToDelete = schedule.filter(i => i.routineId === editingRoutineId);
                await Promise.all(itemsToDelete.map(i => deleteScheduleService(i.id)));
                currentSchedule = schedule.filter(i => i.routineId !== editingRoutineId);
            }

            const createdItems = await Promise.all(newItems.map(item => createScheduleService(item)));
            setSchedule([...currentSchedule, ...createdItems]);
            toast.success("Rotina salva em lote");
            setEditingRoutineId(null);
        } catch (error) {
            toast.error("Erro ao salvar rotina em lote");
        }
    };

    const handleDeleteRoutine = (routineId: string) => {
        setConfirmDeleteRoutineId(routineId);
    };

    const confirmDeleteRoutineAction = async () => {
        if (confirmDeleteRoutineId) {
            try {
                toast.info("Removendo rotina...");
                const itemsToDelete = schedule.filter(i => i.routineId === confirmDeleteRoutineId);
                await Promise.all(itemsToDelete.map(i => deleteScheduleService(i.id)));
                setSchedule(schedule.filter(i => i.routineId !== confirmDeleteRoutineId));
                toast.success("Rotina removida");
            } catch (e) {
                toast.error("Erro ao remover rotina");
            }
            setConfirmDeleteRoutineId(null);
        }
    };

    const handleEditRoutine = (routineId: string, exampleItem: ScheduleItem) => {
        // Pre-fill config from example item
        setIsManagerDialogOpen(false);
        setEditingRoutineId(routineId);
        setBulkConfig({
            title: exampleItem.title,
            description: exampleItem.description || "",
            time: exampleItem.time,
            endTime: exampleItem.endTime || "",
            type: exampleItem.type as any,
            startDate: exampleItem.date || "", // This might be lossy if not stored on routine level, but good enough for now
            endDate: exampleItem.date || "", // User will have to re-select range
            daysOfWeek: [1, 2, 3, 4, 5], // Default, hard to infer perfectly without better data structure
            classId: exampleItem.classId || "all",
            projectId: exampleItem.projectId || undefined
        });
        setIsBulkDialogOpen(true);
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[500px]">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mr-3" />
                <div className="text-slate-500 text-lg animate-pulse">Carregando agenda...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("min-w-[240px] justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(currentDate, "PPP", { locale: ptBR })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            {/* @ts-ignore */}
                            <Calendar mode="single" selected={currentDate} onSelect={(date: any) => date && setCurrentDate(date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {canEdit && (
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione a turma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as turmas</SelectItem>
                                {availableClasses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipo de Atividade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            <SelectItem value="activity">Atividade</SelectItem>
                            <SelectItem value="meal">Alimentação</SelectItem>
                            <SelectItem value="care">Cuidado/Higiene</SelectItem>
                            <SelectItem value="project">Sessão de Projeto</SelectItem>
                        </SelectContent>
                    </Select>

                    {canEdit && (
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={() => setIsManagerDialogOpen(true)}>
                                <Settings2 className="w-4 h-4" />
                                Gerenciar Rotinas
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Novo
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleAdd}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Item Único
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleBulkCreateOptions}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Nova Rotina (Massa)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        Agenda do Dia
                        {selectedClassId !== "all" && <span className="text-slate-500 text-base font-normal">- {classes.find(c => c.id === selectedClassId)?.name}</span>}
                    </h2>
                    {canEdit && (
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                disabled={selectedClassId === "all"}
                                onClick={() => setIsDailyLogOpen(true)}
                                title={selectedClassId === "all" ? "Selecione uma turma específica para preencher o diário" : "Preencher Diário da Turma"}
                            >
                                📝 Preencher Diário de Bordo
                            </Button>
                        </div>
                    )}
                </div>

                {filteredSchedule.length > 0 ? (
                    <DailySchedule items={filteredSchedule.sort((a, b) => a.time.localeCompare(b.time))} onEdit={canEdit ? handleEdit : undefined} onDelete={canEdit ? handleDelete : undefined} />
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        Nenhum item agendado para este dia/turma.
                    </div>
                )}
            </div>

            <ScheduleDialog
                open={isScheduleDialogOpen}
                onOpenChange={setIsScheduleDialogOpen}
                item={editingItem}
                classes={classes}
                students={students}
                projects={projects}
                onSave={handleSave}
            />

            <BulkRoutineDialog
                open={isBulkDialogOpen}
                onOpenChange={setIsBulkDialogOpen}
                classes={classes}
                students={students}
                projects={projects}
                onSave={handleBulkSave}
            />

            <RoutineManagerDialog
                open={isManagerDialogOpen}
                onOpenChange={setIsManagerDialogOpen}
                schedule={schedule}
                classes={classes}
                students={students}
                projects={projects}
                onDeleteRoutine={handleDeleteRoutine}
                onEditRoutine={handleEditRoutine}
                onDeleteProjectSessions={(projectId) => {
                    setConfirmDeleteProjectId(projectId);
                }}
                onEditProjectSessionsBulk={async (projectId, config) => {
                    try {
                        toast.info("Reescrevendo sessões do projeto...");
                        // Remove all existing sessions for this project
                        const existingProjectSessions = schedule.filter(s => s.projectId === projectId);
                        await Promise.all(existingProjectSessions.map(s => deleteScheduleService(s.id)));
                        const remaining = schedule.filter(s => s.projectId !== projectId);

                        const effectiveClasses = config.classId && config.classId !== "all"
                            ? [config.classId]
                            : classes.map(c => c.id);

                        const start = new Date(config.startDate + "T12:00:00");
                        const end = new Date(config.endDate + "T12:00:00");
                        const newSessions: Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">[] = [];
                        const cur = new Date(start);
                        while (cur <= end) {
                            if (config.daysOfWeek.includes(cur.getDay())) {
                                for (const classId of effectiveClasses) {
                                    newSessions.push({
                                        title: config.title,
                                        description: config.description || null,
                                        type: "project",
                                        date: format(cur, "yyyy-MM-dd"),
                                        time: config.time,
                                        endTime: config.endTime || null,
                                        projectId,
                                        classId,
                                    });
                                }
                            }
                            cur.setDate(cur.getDate() + 1);
                        }
                        const createdOptions = await Promise.all(newSessions.map(ns => createScheduleService(ns)));
                        setSchedule([...remaining, ...createdOptions]);
                        toast.success("Sessões replanejadas");
                    } catch (e) {
                        toast.error("Erro ao replanejar sessões");
                    }
                }}
            />

            <DailyLogDialog
                open={isDailyLogOpen}
                onOpenChange={setIsDailyLogOpen}
                date={currentDate}
                classId={selectedClassId}
                students={students}
            />

            <BulkPortfolioDialog
                key={`bulk-port-${format(currentDate, "yyyy-MM-dd")}-${selectedClassId}`}
                open={isBulkPortfolioOpen}
                onOpenChange={setIsBulkPortfolioOpen}
                date={currentDate}
                classes={classes}
                classId={selectedClassId}
                students={students}
            />

            <ConfirmDialog
                open={!!confirmDeleteItem}
                onOpenChange={(open) => !open && setConfirmDeleteItem(null)}
                title="Remover Item"
                description="Tem certeza que deseja remover este item da agenda?"
                onConfirm={confirmDeleteAction}
            />

            <ConfirmDialog
                open={!!confirmDeleteRoutineId}
                onOpenChange={(open) => !open && setConfirmDeleteRoutineId(null)}
                title="Excluir Rotina"
                description="Tem certeza que deseja excluir esta rotina? Isso removerá TODAS as ocorrências desta rotina."
                onConfirm={confirmDeleteRoutineAction}
            />

            <ConfirmDialog
                open={!!confirmDeleteProjectId}
                onOpenChange={(open) => !open && setConfirmDeleteProjectId(null)}
                title="Excluir Sessões de Projeto"
                description="Tem certeza que deseja excluir todas as sessões deste projeto?"
                onConfirm={async () => {
                    if (confirmDeleteProjectId) {
                        try {
                            toast.info("Excluindo sessões...");
                            const sessionsToDelete = schedule.filter(s => s.projectId === confirmDeleteProjectId);
                            await Promise.all(sessionsToDelete.map(s => deleteScheduleService(s.id)));
                            setSchedule(schedule.filter(s => s.projectId !== confirmDeleteProjectId));
                            toast.success("Sessões excluídas");
                        } catch (e) {
                            toast.error("Erro ao excluir sessões");
                        }
                        setConfirmDeleteProjectId(null);
                    }
                }}
            />
        </div>
    );
}

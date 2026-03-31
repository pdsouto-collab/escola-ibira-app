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
import { ScheduleItem } from "@/lib/data";
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AgendaPage() {
    const { schedule, updateSchedule } = useAppStore();
    const { data: session } = useSession();
    const currentUser = session?.user as any;

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
            const [classesData, studentsData, projectsData] = await Promise.all([
                getClasses(),
                getStudents(),
                getProjects()
            ]);
            setClasses(classesData);
            setStudents(studentsData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
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

    const confirmDeleteAction = () => {
        if (confirmDeleteItem) {
            updateSchedule(schedule.filter(i => i.id !== confirmDeleteItem.id));
            setConfirmDeleteItem(null);
        }
    };

    const handleSave = (item: ScheduleItem) => {
        const newItem = {
            ...item,
            classId: item.classId || (selectedClassId === "all" ? availableClasses[0]?.id : selectedClassId),
            date: item.date || format(currentDate, 'yyyy-MM-dd'),
            projectId: item.projectId
        };

        if (editingItem) {
            updateSchedule(schedule.map(i => i.id === item.id ? newItem : i));
        } else {
            updateSchedule([...schedule, newItem]);
        }
    };

    const canEdit = ["admin", "director", "teacher"].includes(currentUser?.role || "");

    const handleBulkCreateOptions = () => {
        setBulkConfig(undefined);
        setEditingRoutineId(null);
        setIsBulkDialogOpen(true);
    }

    const handleBulkSave = (config: BulkRoutineConfig) => {
        // If editing a routine, first remove old items
        let currentSchedule = schedule;
        if (editingRoutineId) {
            currentSchedule = schedule.filter(i => i.routineId !== editingRoutineId);
        }

        const routineId = editingRoutineId || crypto.randomUUID();
        const newItems: ScheduleItem[] = [];
        const start = new Date(config.startDate + "T00:00:00"); // Ensure local time
        const end = new Date(config.endDate + "T00:00:00");

        // Helper to add item
        const addItem = (date: Date, cId?: string) => {
            newItems.push({
                id: crypto.randomUUID(),
                time: config.time,
                endTime: config.endTime,
                title: config.title,
                description: config.description,
                type: config.type,
                date: format(date, 'yyyy-MM-dd'),
                classId: cId,
                routineId: routineId,
                projectId: config.projectId // Pass the selected project
            });
        };

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (config.daysOfWeek.includes(d.getDay())) {
                if (config.classId === "all") {
                    // Create for all available classes
                    availableClasses.forEach(c => addItem(new Date(d), c.id));
                } else {
                    addItem(new Date(d), config.classId);
                }
            }
        }

        updateSchedule([...currentSchedule, ...newItems]);
        setEditingRoutineId(null);
    };

    const handleDeleteRoutine = (routineId: string) => {
        setConfirmDeleteRoutineId(routineId);
    };

    const confirmDeleteRoutineAction = () => {
        if (confirmDeleteRoutineId) {
            updateSchedule(schedule.filter(i => i.routineId !== confirmDeleteRoutineId));
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
            type: exampleItem.type,
            startDate: exampleItem.date || "", // This might be lossy if not stored on routine level, but good enough for now
            endDate: exampleItem.date || "", // User will have to re-select range
            daysOfWeek: [1, 2, 3, 4, 5], // Default, hard to infer perfectly without better data structure
            classId: exampleItem.classId || "all",
            projectId: exampleItem.projectId
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
                onEditProjectSessionsBulk={(projectId, config) => {
                    // Remove all existing sessions for this project
                    const remaining = schedule.filter(s => s.projectId !== projectId);
                    
                    const effectiveClasses = config.classId && config.classId !== "all"
                        ? [config.classId]
                        : classes.map(c => c.id); // For all classes

                    // Regenerate sessions for the new date range
                    const start = new Date(config.startDate + "T12:00:00");
                    const end = new Date(config.endDate + "T12:00:00");
                    const newSessions: import("@/lib/data").ScheduleItem[] = [];
                    const cur = new Date(start);
                    while (cur <= end) {
                        if (config.daysOfWeek.includes(cur.getDay())) {
                            for (const classId of effectiveClasses) {
                                newSessions.push({
                                    id: crypto.randomUUID(),
                                    title: config.title,
                                    description: config.description,
                                    type: "project",
                                    date: format(cur, "yyyy-MM-dd"),
                                    time: config.time,
                                    endTime: config.endTime,
                                    projectId,
                                    classId,
                                } as import("@/lib/data").ScheduleItem);
                            }
                        }
                        cur.setDate(cur.getDate() + 1);
                    }
                    updateSchedule([...remaining, ...newSessions]);
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
                onConfirm={() => {
                    if (confirmDeleteProjectId) {
                        updateSchedule(schedule.filter(s => s.projectId !== confirmDeleteProjectId));
                        setConfirmDeleteProjectId(null);
                    }
                }}
            />
        </div>
    );
}

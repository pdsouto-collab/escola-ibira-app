"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Project, ScheduleItem } from "@/lib/data";

import { LibrarySelector } from "@/components/biblioteca/library-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Check, ChevronRight, ChevronLeft, Save, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NewProjectWizard() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Carregando...</div>}>
            <NewProjectWizardContent />
        </Suspense>
    );
}

function NewProjectWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const { addProject, updateProject, projects, classes, schedule, updateSchedule, libraryItems } = useAppStore();

    // Determine if we are in Edit Mode
    const [isEditMode, setIsEditMode] = useState(false);
    const [originalProject, setOriginalProject] = useState<Project | null>(null);

    const [currentStep, setCurrentStep] = useState(1);

    // Mock State for Form Data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classes: [] as string[],
        bnccSkills: [] as string[],
        customContent: [] as string[],
        // New: Project Schedule Items
        projectSchedule: [] as Partial<ScheduleItem>[]
    });

    const [newSession, setNewSession] = useState({
        date: new Date(),
        time: "09:00",
        endTime: "10:00",
        description: "" // Activity title/desc
    });

    // Load Project Data if EditId is present
    useEffect(() => {
        if (editId && projects.length > 0) {
            const projectToEdit = projects.find(p => p.id === editId);
            if (projectToEdit) {
                setIsEditMode(true);
                setOriginalProject(projectToEdit);

                // Find associated schedule items
                const projectItems = schedule.filter(s => s.projectId === editId);

                setFormData({
                    title: projectToEdit.title,
                    description: projectToEdit.description,
                    classes: projectToEdit.classes || [],
                    bnccSkills: projectToEdit.bnccSkillIds || [],
                    customContent: projectToEdit.contentIds || [],
                    projectSchedule: projectItems.map(item => ({
                        ...item,
                        date: item.date // Keep as string for now
                    }))
                });
            }
        }
    }, [editId, projects, schedule]);

    const handleAddSession = () => {
        if (!newSession.description) return;

        const item: Partial<ScheduleItem> = {
            id: Math.random().toString(36).substr(2, 9),
            date: format(newSession.date, 'yyyy-MM-dd'),
            time: newSession.time,
            endTime: newSession.endTime,
            title: newSession.description, // Using description as title for the schedule item
            type: 'activity',
            description: `Atividade do projeto: ${formData.title}`
        };

        setFormData({
            ...formData,
            projectSchedule: [...formData.projectSchedule, item]
        });

        // Reset inputs
        setNewSession({ ...newSession, description: "" });
    };

    const handleRemoveSession = (id: string) => {
        setFormData({
            ...formData,
            projectSchedule: formData.projectSchedule.filter(i => i.id !== id)
        });
    };

    const handleSave = () => {
        // Use existing ID if editing, otherwise generate new
        const projectId = isEditMode && editId ? editId : Math.random().toString(36).substr(2, 9);

        const projectData: Project = {
            id: projectId,
            title: formData.title || "Novo Projeto",
            description: formData.description,
            status: originalProject?.status || "planning", // Keep status if editing
            startDate: originalProject?.startDate || new Date().toISOString(),
            students: [], // Could map classes here in a real app
            classes: formData.classes,
            tags: ["Pedagógico"],
            bnccSkillIds: formData.bnccSkills,
            contentIds: formData.customContent
        };

        if (isEditMode) {
            updateProject(projectId, projectData);

            // FOR SCHEDULE:
            // 1. Remove old items linked to this project (simple approach)
            // 2. Add new items
            // Ideally we would diff them, but for prototype simpler is better.
            const otherItems = schedule.filter(s => s.projectId !== projectId);

            // Prepare new items
            const newScheduleItems = formData.projectSchedule.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                time: item.time || "09:00",
                endTime: item.endTime,
                title: item.title || "Atividade de Projeto",
                type: "activity" as const,
                description: item.description,
                date: item.date as string, // Cast because we know it's a string from form
                classId: formData.classes[0] || "all",
                projectId: projectId
            }));

            updateSchedule([...otherItems, ...newScheduleItems]);

        } else {
            addProject(projectData);
            // Add Schedule Items
            if (formData.projectSchedule.length > 0) {
                const newScheduleItems = formData.projectSchedule.map(item => ({
                    id: item.id || Math.random().toString(36).substr(2, 9),
                    time: item.time || "09:00",
                    endTime: item.endTime,
                    title: item.title || "Atividade de Projeto",
                    type: "activity" as const,
                    description: item.description,
                    date: item.date as string,
                    classId: formData.classes[0] || "all",
                    projectId: projectId
                }));
                updateSchedule([...schedule, ...newScheduleItems]);
            }
        }

        router.push("/projetos");
    };

    const steps = [
        { id: 1, label: "Detalhes" },
        { id: 2, label: "Aplicação do projeto" },
        { id: 3, label: "Habilidades e conteúdos" },
        { id: 4, label: "Planejamento de encontros" }
    ];

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Wizard Header */}
            <div className="bg-white border-b px-8 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-8">
                    {steps.map((step, index) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;

                        return (
                            <div key={step.id} className={cn("flex items-center gap-2 text-sm font-medium",
                                isActive ? "text-slate-900 border-b-2 border-slate-900 pb-4 mb-[-17px]" :
                                    isCompleted ? "text-green-600" : "text-slate-400"
                            )}>
                                {isCompleted ? <Check className="w-4 h-4" /> : <span>{step.id}.</span>}
                                {step.label}
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-2">
                    <Link href="/projetos">
                        <Button variant="ghost">Cancelar</Button>
                    </Link>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8 min-h-[500px]">

                    {/* Step 1: Detalhes */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-slate-800">Detalhes do Projeto</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nome do Projeto</label>
                                    <Input
                                        placeholder="Ex: Explorando o Sistema Solar"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Descrição</label>
                                    <Textarea
                                        placeholder="Descreva o objetivo e a metodologia do projeto..."
                                        className="h-32"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Aplicação */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-slate-800">Aplicação do Projeto</h2>
                            <p className="text-slate-500">Selecione as turmas que participarão deste projeto.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classes.map((schoolClass) => (
                                    <div
                                        key={schoolClass.id}
                                        className={cn(
                                            "flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors hover:bg-slate-50",
                                            formData.classes.includes(schoolClass.id) ? "border-primary bg-primary/5" : "border-slate-200"
                                        )}
                                        onClick={() => {
                                            const newClasses = formData.classes.includes(schoolClass.id)
                                                ? formData.classes.filter(id => id !== schoolClass.id)
                                                : [...formData.classes, schoolClass.id];
                                            setFormData({ ...formData, classes: newClasses });
                                        }}
                                    >
                                        <Checkbox
                                            id={schoolClass.id}
                                            checked={formData.classes.includes(schoolClass.id)}
                                            onCheckedChange={(checked) => {
                                                const newClasses = checked
                                                    ? [...formData.classes, schoolClass.id]
                                                    : formData.classes.filter(id => id !== schoolClass.id);
                                                setFormData({ ...formData, classes: newClasses });
                                            }}
                                        />
                                        <label
                                            htmlFor={schoolClass.id}
                                            className="text-sm font-medium leading-none cursor-pointer w-full select-none"
                                            onClick={(e) => e.stopPropagation()} // Prevent double toggle
                                        >
                                            {schoolClass.name}
                                            {schoolClass.description && (
                                                <span className="block text-xs text-slate-500 mt-1 font-normal">
                                                    {schoolClass.description}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {classes.length === 0 && (
                                <div className="text-center p-8 border-2 border-dashed rounded-xl bg-slate-50">
                                    <p className="text-slate-500">Nenhuma turma cadastrada no sistema.</p>
                                    <Link href="/alunos">
                                        <Button variant="link" className="mt-2">Gerenciar Turmas</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Library Selection */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full space-y-8 pb-8">
                            <LibrarySelector
                                selectedIds={[...formData.bnccSkills, ...formData.customContent]}
                                onSelect={(ids) => {
                                    // The selector returns mixed IDs. For simplicity in the form state,
                                    // we could split them back into bncc vs custom, but let's just use the store
                                    // to see which is which. A quick hack is just setting all of them to customContent
                                    // and sorting it out during save, or splitting them right here.
                                    // Since we will save them in project.bnccSkillIds and project.contentIds:
                                    const bncc = ids.filter(id => libraryItems.find((i: any) => i.id === id)?.isBNCC);
                                    const custom = ids.filter(id => !libraryItems.find((i: any) => i.id === id)?.isBNCC);

                                    setFormData({
                                        ...formData,
                                        bnccSkills: bncc,
                                        customContent: custom
                                    });
                                }}
                            />
                        </div>
                    )}

                    {/* Step 4: Planejamento */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-slate-800">Planejamento de Encontros</h2>
                            <p className="text-slate-500">Defina o cronograma das atividades. Esses eventos aparecerão automaticamente na Agenda.</p>

                            {/* Schedule Form */}
                            <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border">
                                <div className="space-y-2 flex-1">
                                    <label className="text-xs font-medium text-slate-700">O que será feito?</label>
                                    <Input
                                        placeholder="Ex: Roda de conversa inicial"
                                        value={newSession.description}
                                        onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700">Data</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !newSession.date && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newSession.date ? format(newSession.date, "PPP", { locale: ptBR }) : <span>Selecione</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            {/* @ts-ignore */}
                                            <Calendar mode="single" selected={newSession.date} onSelect={(date) => date && setNewSession({ ...newSession, date })} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700">Horário</label>
                                    <div className="flex items-center gap-2">
                                        <Input type="time" className="w-24" value={newSession.time} onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} />
                                        <span>às</span>
                                        <Input type="time" className="w-24" value={newSession.endTime} onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })} />
                                    </div>
                                </div>
                                <Button onClick={handleAddSession} disabled={!newSession.description}>
                                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                                </Button>
                            </div>

                            {/* Schedule List */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-700">Cronograma ({formData.projectSchedule.length} encontros)</h3>
                                {formData.projectSchedule.length > 0 ? (
                                    <div className="border rounded-xl divide-y">
                                        {formData.projectSchedule.map((item, idx) => (
                                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                                        <CalendarIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{item.title}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {format(new Date(item.date!), "dd/MM/yyyy")} • {item.time} - {item.endTime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveSession(item.id!)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 italic bg-white border border-dashed rounded-xl">
                                        Nenhum encontro agendado ainda.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-white border-t px-8 py-4 flex justify-between items-center flex-shrink-0">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                </Button>

                {currentStep < 4 ? (
                    <Button onClick={nextStep} className="gap-2 px-8">
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} className="gap-2 px-8 bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4" />
                        Finalizar Projeto
                    </Button>
                )}
            </div>
        </div>
    );
}
